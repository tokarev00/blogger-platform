import bcrypt from "bcrypt";
import {randomUUID} from "crypto";
import {UsersRepository} from "../../users/repositories/users.repository";
import {JwtService, REFRESH_TOKEN_TTL_SECONDS} from "./jwt.service";
import {EmailConfirmation, User, UserAccount} from "../../users/domain/user";
import {EmailSender} from "./email.sender";
import {FieldError} from "../../core/types/field-error";
import {RefreshTokensRepository, RefreshTokenModel} from "../repositories/refresh-tokens.repository";

const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_SECONDS * 1000;

const CONFIRMATION_CODE_TTL_HOURS = 24;
const RECOVERY_CODE_TTL_HOURS = 24;

const SALT_ROUNDS = 10;

const buildRefreshTokenExpiration = () => new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString();

async function findActiveSessionByRefreshToken(refreshToken: string): Promise<RefreshTokenModel | null> {
    const payload = JwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
        return null;
    }

    const existingToken = await RefreshTokensRepository.findByTokenId(payload.tokenId);
    if (!existingToken || existingToken.isRevoked) {
        return null;
    }

    const isExpired = new Date(existingToken.expiresAt) < new Date();
    if (isExpired) {
        await RefreshTokensRepository.revoke(existingToken.tokenId);
        return null;
    }

    if (existingToken.userId !== payload.userId || existingToken.deviceId !== payload.deviceId) {
        return null;
    }

    return existingToken;
}

const buildConfirmationData = (overrides?: Partial<EmailConfirmation>): EmailConfirmation => ({
    isConfirmed: overrides?.isConfirmed ?? false,
    confirmationCode: overrides?.confirmationCode ?? randomUUID(),
    expirationDate:
        overrides?.expirationDate ?? new Date(Date.now() + CONFIRMATION_CODE_TTL_HOURS * 60 * 60 * 1000).toISOString(),
});

const buildRecoveryData = () => ({
    recoveryCode: randomUUID(),
    expirationDate: new Date(Date.now() + RECOVERY_CODE_TTL_HOURS * 60 * 60 * 1000).toISOString(),
});

type RegistrationResult =
    | {status: "success"}
    | {status: "error"; error: FieldError};

export const AuthService = {
    async validateCredentials(loginOrEmail: string, password: string): Promise<UserAccount | null> {
        const user = await UsersRepository.findAccountByLoginOrEmail(loginOrEmail);
        if (!user) {
            return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return null;
        }

        if (!user.emailConfirmation.isConfirmed) {
            return null;
        }

        return user;
    },

    async createSession(
        userId: string,
        data: {ip: string; title: string},
    ): Promise<{accessToken: string; refreshToken: string}> {
        const deviceId = randomUUID();
        const refreshTokenId = randomUUID();
        const accessToken = JwtService.createAccessToken(userId);
        const refreshToken = JwtService.createRefreshToken(userId, deviceId, refreshTokenId);

        const lastActiveDate = new Date().toISOString();
        const expiresAt = buildRefreshTokenExpiration();
        await RefreshTokensRepository.create({
            userId,
            tokenId: refreshTokenId,
            deviceId,
            ip: data.ip,
            title: data.title,
            lastActiveDate,
            expiresAt,
        });

        return {accessToken, refreshToken};
    },

    async refreshTokens(refreshToken: string): Promise<{accessToken: string; refreshToken: string} | null> {
        const existingSession = await findActiveSessionByRefreshToken(refreshToken);
        if (!existingSession) {
            return null;
        }

        const newTokenId = randomUUID();
        const lastActiveDate = new Date().toISOString();
        const expiresAt = buildRefreshTokenExpiration();
        const isUpdated = await RefreshTokensRepository.updateSessionByDeviceId(existingSession.deviceId, {
            tokenId: newTokenId,
            lastActiveDate,
            expiresAt,
        });

        if (!isUpdated) {
            return null;
        }

        const accessToken = JwtService.createAccessToken(existingSession.userId);
        const newRefreshToken = JwtService.createRefreshToken(
            existingSession.userId,
            existingSession.deviceId,
            newTokenId,
        );

        return {accessToken, refreshToken: newRefreshToken};
    },

    async logout(refreshToken: string): Promise<boolean> {
        const existingSession = await findActiveSessionByRefreshToken(refreshToken);
        if (!existingSession) {
            return false;
        }

        await RefreshTokensRepository.deleteByDeviceId(existingSession.deviceId);
        return true;
    },

    async getSessionByRefreshToken(refreshToken: string): Promise<RefreshTokenModel | null> {
        return findActiveSessionByRefreshToken(refreshToken);
    },

    async getUserById(userId: string): Promise<User | null> {
        return UsersRepository.findById(userId);
    },

    async confirmRegistration(code: string): Promise<boolean> {
        const user = await UsersRepository.findAccountByConfirmationCode(code);
        if (!user || user.emailConfirmation.isConfirmed) {
            return false;
        }

        if (!user.emailConfirmation.expirationDate) {
            return false;
        }

        const isExpired = new Date(user.emailConfirmation.expirationDate) < new Date();
        if (isExpired) {
            return false;
        }

        const confirmationResult = await UsersRepository.confirmEmail(user.id);
        return confirmationResult;
    },

    async resendRegistrationEmail(email: string, baseUrl: string): Promise<'success' | 'notFound' | 'alreadyConfirmed'> {
        const user = await UsersRepository.findAccountByEmail(email);
        if (!user) {
            return 'notFound';
        }

        if (user.emailConfirmation.isConfirmed) {
            return 'alreadyConfirmed';
        }

        const confirmation = buildConfirmationData({isConfirmed: false});
        const updateResult = await UsersRepository.updateEmailConfirmation(user.id, confirmation);
        if (!updateResult) {
            return 'notFound';
        }

        const confirmationCode = confirmation.confirmationCode;
        if (!confirmationCode) {
            return 'notFound';
        }

        const confirmationUrl = new URL('/confirm-email', baseUrl);
        confirmationUrl.searchParams.set('code', confirmationCode);

        await EmailSender.sendRegistrationEmail({
            email: user.email,
            confirmationUrl: confirmationUrl.toString(),
        });

        return 'success';
    },

    async requestPasswordRecovery(email: string): Promise<void> {
        const user = await UsersRepository.findAccountByEmail(email);
        if (!user) {
            return;
        }

        const recovery = buildRecoveryData();
        await UsersRepository.updatePasswordRecovery(user.id, recovery);

        const recoveryUrl = new URL('https://somesite.com/password-recovery');
        recoveryUrl.searchParams.set('recoveryCode', recovery.recoveryCode);

        await EmailSender.sendPasswordRecoveryEmail({
            email: user.email,
            recoveryUrl: recoveryUrl.toString(),
        });
    },

    async confirmPasswordRecovery(recoveryCode: string, newPassword: string): Promise<'success' | 'invalid'> {
        const user = await UsersRepository.findAccountByRecoveryCode(recoveryCode);
        if (!user || !user.passwordRecovery.recoveryCode) {
            return 'invalid';
        }

        const isExpired =
            !user.passwordRecovery.expirationDate ||
            new Date(user.passwordRecovery.expirationDate) < new Date();
        if (isExpired) {
            return 'invalid';
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        const updateResult = await UsersRepository.updatePasswordHash(user.id, passwordHash);
        return updateResult ? 'success' : 'invalid';
    },

    async registerUser(
        data: {login: string; password: string; email: string},
        baseUrl: string,
    ): Promise<RegistrationResult> {
        const isLoginTaken = await UsersRepository.isLoginTaken(data.login);
        if (isLoginTaken) {
            return {
                status: 'error',
                error: {field: 'login', message: 'login should be unique'},
            };
        }

        const isEmailTaken = await UsersRepository.isEmailTaken(data.email);
        if (isEmailTaken) {
            return {
                status: 'error',
                error: {field: 'email', message: 'email should be unique'},
            };
        }

        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
        const confirmation = buildConfirmationData();

        await UsersRepository.create({
            login: data.login,
            email: data.email,
            passwordHash,
            emailConfirmation: confirmation,
        });

        const confirmationCode = confirmation.confirmationCode;
        if (!confirmationCode) {
            throw new Error('Failed to generate confirmation code');
        }

        const confirmationUrl = new URL('/confirm-email', baseUrl);
        confirmationUrl.searchParams.set('code', confirmationCode);

        await EmailSender.sendRegistrationEmail({
            email: data.email,
            confirmationUrl: confirmationUrl.toString(),
        });

        return {status: 'success'};
    },
};

export type {RegistrationResult};
