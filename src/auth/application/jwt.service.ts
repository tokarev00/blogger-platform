import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET ?? 'very_secret_key';
const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60;

function getTokenTtlSeconds(): number {
    const raw = process.env.JWT_EXPIRES_IN;
    if (!raw) {
        return DEFAULT_TOKEN_TTL_SECONDS;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return DEFAULT_TOKEN_TTL_SECONDS;
    }
    return Math.floor(parsed);
}

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

export const JwtService = {
    createAccessToken(userId: string): string {
        const header = {alg: 'HS256', typ: 'JWT'};
        const issuedAt = Math.floor(Date.now() / 1000);
        const expiresAt = issuedAt + getTokenTtlSeconds();
        const payload = {userId, iat: issuedAt, exp: expiresAt};

        const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)));
        const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
        const signature = sign(`${encodedHeader}.${encodedPayload}`);

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    },

    verifyAccessToken(token: string): AccessTokenPayload | null {
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
            const payload = JSON.parse(payloadJson) as {userId?: unknown; exp?: unknown};
            if (typeof payload.userId !== 'string') {
                return null;
            }
            if (typeof payload.exp === 'number') {
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp < now) {
                    return null;
                }
            }
            return {userId: payload.userId};
        } catch (error) {
            return null;
        }
    },
};

export type {AccessTokenPayload};
