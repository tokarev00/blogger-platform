import bcrypt from "bcrypt";
import {randomUUID} from "crypto";
import {UsersRepository} from "../../users/repositories/users.repository";
import {JwtService} from "./jwt.service";
import {EmailConfirmation, User, UserAccount} from "../../users/domain/user";
import {EmailSender} from "./email.sender";

const CONFIRMATION_CODE_TTL_HOURS = 24;

const buildConfirmationData = (overrides?: Partial<EmailConfirmation>): EmailConfirmation => ({
    isConfirmed: overrides?.isConfirmed ?? false,
    confirmationCode: overrides?.confirmationCode ?? randomUUID(),
    expirationDate:
        overrides?.expirationDate ?? new Date(Date.now() + CONFIRMATION_CODE_TTL_HOURS * 60 * 60 * 1000).toISOString(),
});

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

    createAccessToken(userId: string): string {
        return JwtService.createAccessToken(userId);
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
};
