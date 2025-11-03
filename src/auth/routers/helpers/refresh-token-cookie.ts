import {Request, Response, CookieOptions} from "express";
import {REFRESH_TOKEN_TTL_SECONDS} from "../../application/jwt.service";

const REFRESH_COOKIE_NAME = 'refreshToken';

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
};

const CLEAR_REFRESH_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
};

export function setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE_NAME, token, REFRESH_COOKIE_OPTIONS);
}

export function clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, CLEAR_REFRESH_COOKIE_OPTIONS);
}

export function getRefreshTokenFromRequest(req: Request): string | null {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
        const [rawName, ...rawValueParts] = cookie.trim().split('=');
        if (!rawName) {
            continue;
        }
        if (rawName === REFRESH_COOKIE_NAME) {
            const rawValue = rawValueParts.join('=');
            try {
                return decodeURIComponent(rawValue);
            } catch (error) {
                return rawValue;
            }
        }
    }

    return null;
}
