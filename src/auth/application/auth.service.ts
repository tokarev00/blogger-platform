import bcrypt from "bcrypt";
import {UsersRepository} from "../../users/repositories/users.repository";

export const AuthService = {
    async verifyCredentials(loginOrEmail: string, password: string): Promise<boolean> {
        const user = await UsersRepository.findAccountByLoginOrEmail(loginOrEmail);
        if (!user) {
            return false;
        }

        return bcrypt.compare(password, user.passwordHash);
    },
};
