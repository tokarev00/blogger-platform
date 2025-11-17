import {Request, Response, NextFunction} from "express";
import {HttpStatus} from "../../core/types/http-statuses";

const WINDOW_MS = 10_000;
const MAX_ATTEMPTS = 5;

const attemptsByIp = new Map<string, number[]>();

const getClientIp = (req: Request): string => {
    return req.ip || req.socket.remoteAddress || 'unknown';
};

export const authRateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const attempts = attemptsByIp.get(ip) ?? [];
    const recentAttempts = attempts.filter((timestamp) => now - timestamp <= WINDOW_MS);
    recentAttempts.push(now);
    attemptsByIp.set(ip, recentAttempts);

    if (recentAttempts.length > MAX_ATTEMPTS) {
        return res.sendStatus(HttpStatus.TooManyRequests);
    }

    return next();
};

export const resetAuthRateLimiter = () => {
    attemptsByIp.clear();
};
