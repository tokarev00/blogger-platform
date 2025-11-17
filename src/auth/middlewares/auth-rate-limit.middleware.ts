import {Request, Response, NextFunction} from "express";
import {HttpStatus} from "../../core/types/http-statuses";

const WINDOW_MS = 10_000;
const MAX_ATTEMPTS = 5;

type RateLimitKey = string;

const attemptsByKey = new Map<RateLimitKey, number[]>();

const getClientIp = (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
};

const getRateLimitKey = (req: Request): RateLimitKey => {
    const endpoint = req.originalUrl || req.url || 'unknown-endpoint';
    return `${getClientIp(req)}:${req.method}:${endpoint}`;
};

export const authRateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const key = getRateLimitKey(req);
    const now = Date.now();
    const attempts = attemptsByKey.get(key) ?? [];
    const recentAttempts = attempts.filter((timestamp) => now - timestamp <= WINDOW_MS);
    recentAttempts.push(now);
    attemptsByKey.set(key, recentAttempts);

    if (recentAttempts.length > MAX_ATTEMPTS) {
        return res.sendStatus(HttpStatus.TooManyRequests);
    }

    return next();
};

export const resetAuthRateLimiter = () => {
    attemptsByKey.clear();
};
