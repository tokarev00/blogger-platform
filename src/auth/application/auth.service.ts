import bcrypt from "bcrypt";
import {UsersRepository} from "../../users/repositories/users.repository";
import {JwtService} from "./jwt.service";
import {User, UserAccount} from "../../users/domain/user";

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

        return user;
    },

    createAccessToken(userId: string): string {
        return JwtService.createAccessToken(userId);
    },

    async getUserById(userId: string): Promise<User | null> {
        return UsersRepository.findById(userId);
    },
};
