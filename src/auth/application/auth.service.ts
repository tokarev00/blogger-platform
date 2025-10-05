import {createHmac} from "crypto";
import bcrypt from "bcrypt";
import {UsersRepository} from "../../users/repositories/users.repository";
import {UserAccount} from "../../users/domain/user";

const JWT_SECRET = process.env.JWT_SECRET || "jwt-secret";
const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.JWT_ACCESS_TOKEN_TTL_SECONDS) || 60 * 10;

const base64UrlEncode = (input: Buffer | string): string => {
    return Buffer.from(input)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

const createToken = (payload: Record<string, unknown>, secret: string, ttlSeconds: number): string => {
    const header = {alg: "HS256", typ: "JWT"};
    const issuedAt = Math.floor(Date.now() / 1000);
    const body = {
        ...payload,
        iat: issuedAt,
        exp: issuedAt + ttlSeconds,
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(body));
    const signature = createHmac("sha256", secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest();
    const encodedSignature = base64UrlEncode(signature);

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};

export const AuthService = {
    async verifyCredentials(loginOrEmail: string, password: string): Promise<UserAccount | null> {
        const user = await UsersRepository.findAccountByLoginOrEmail(loginOrEmail);
        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    },

    createAccessToken(userId: string): string {
        return createToken({userId}, JWT_SECRET, ACCESS_TOKEN_TTL_SECONDS);
    },
};
