import bcrypt from "bcrypt";
import {randomUUID} from "crypto";
import {UsersRepository} from "../../users/repositories/users.repository";
import {JwtService, REFRESH_TOKEN_TTL_SECONDS} from "./jwt.service";
import {EmailConfirmation, User, UserAccount} from "../../users/domain/user";
import {EmailSender} from "./email.sender";
import {FieldError} from "../../core/types/field-error";
import {RefreshTokensRepository} from "../repositories/refresh-tokens.repository";

const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_SECONDS * 1000;

const CONFIRMATION_CODE_TTL_HOURS = 24;

const SALT_ROUNDS = 10;

const buildConfirmationData = (overrides?: Partial<EmailConfirmation>): EmailConfirmation => ({
    isConfirmed: overrides?.isConfirmed ?? false,
    confirmationCode: overrides?.confirmationCode ?? randomUUID(),
    expirationDate:
        overrides?.expirationDate ?? new Date(Date.now() + CONFIRMATION_CODE_TTL_HOURS * 60 * 60 * 1000).toISOString(),
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

    async createTokenPair(userId: string): Promise<{accessToken: string; refreshToken: string}> {
        const refreshTokenId = randomUUID();
        const accessToken = JwtService.createAccessToken(userId);
        const refreshToken = JwtService.createRefreshToken(userId, refreshTokenId);

        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString();
        await RefreshTokensRepository.create({
            userId,
            tokenId: refreshTokenId,
            expiresAt,
        });

        return {accessToken, refreshToken};
    },

    async refreshTokens(refreshToken: string): Promise<{accessToken: string; refreshToken: string} | null> {
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

        await RefreshTokensRepository.revoke(existingToken.tokenId);

        return AuthService.createTokenPair(payload.userId);
    },

    async logout(refreshToken: string): Promise<boolean> {
        const payload = JwtService.verifyRefreshToken(refreshToken);
        if (!payload) {
            return false;
        }

        const existingToken = await RefreshTokensRepository.findByTokenId(payload.tokenId);
        if (!existingToken || existingToken.isRevoked) {
            return false;
        }

        const isExpired = new Date(existingToken.expiresAt) < new Date();
        if (isExpired) {
            await RefreshTokensRepository.revoke(existingToken.tokenId);
            return false;
        }

        await RefreshTokensRepository.revoke(existingToken.tokenId);
        return true;
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
