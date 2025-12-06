import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET ?? 'very_secret_key';

const ACCESS_TOKEN_TTL_SECONDS = 10 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 20;

function base64UrlEncode(input: Buffer): string {
    return input
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64UrlDecode(input: string): Buffer {
    const normalized = input
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    return Buffer.from(normalized + padding, 'base64');
}

function sign(data: string): string {
    const hmac = crypto.createHmac('sha256', JWT_SECRET);
    hmac.update(data);
    return base64UrlEncode(hmac.digest());
}

type AccessTokenPayload = {
    userId: string;
};

type RefreshTokenPayload = {
    userId: string;
    tokenId: string;
    deviceId: string;
};

function createToken(payload: Record<string, unknown>, ttlSeconds: number): string {
    const header = {alg: 'HS256', typ: 'JWT'};
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + ttlSeconds;
    const tokenPayload = {...payload, iat: issuedAt, exp: expiresAt};

    const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)));
    const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(tokenPayload)));
    const signature = sign(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
        return null;
    }
    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`);
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);
    if (
        signatureBuffer.length !== expectedSignatureBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
        return null;
    }

    try {
        const payloadJson = base64UrlDecode(encodedPayload).toString('utf-8');
        const payload = JSON.parse(payloadJson) as Record<string, unknown>;
        const expiresAt = payload.exp;
        if (typeof expiresAt === 'number') {
            const now = Math.floor(Date.now() / 1000);
            if (expiresAt < now) {
                return null;
            }
        }
        return payload;
    } catch (error) {
        return null;
    }
}

export const JwtService = {
    createAccessToken(userId: string): string {
        return createToken({userId}, ACCESS_TOKEN_TTL_SECONDS);
    },

    verifyAccessToken(token: string): AccessTokenPayload | null {
        const payload = verifyToken(token);
        if (!payload || typeof payload.userId !== 'string') {
            return null;
        }
        return {userId: payload.userId};
    },

    createRefreshToken(userId: string, deviceId: string, tokenId: string): string {
        return createToken({userId, deviceId, tokenId}, REFRESH_TOKEN_TTL_SECONDS);
    },

    verifyRefreshToken(token: string): RefreshTokenPayload | null {
        const payload = verifyToken(token);
        if (
            !payload ||
            typeof payload.userId !== 'string' ||
            typeof payload.tokenId !== 'string' ||
            typeof payload.deviceId !== 'string'
        ) {
            return null;
        }
        return {userId: payload.userId, tokenId: payload.tokenId, deviceId: payload.deviceId};
    },
};

export {ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS};
export type {AccessTokenPayload, RefreshTokenPayload};
