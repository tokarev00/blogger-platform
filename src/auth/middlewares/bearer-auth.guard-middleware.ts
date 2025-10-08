import {NextFunction, Response} from "express";
import {RequestWithUser} from "../types/request-with-user";
import {HttpStatus} from "../../core/types/http-statuses";
import {JwtService} from "../application/jwt.service";

export function bearerAuthGuardMiddleware(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const payload = JwtService.verifyAccessToken(token);
    if (!payload) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    req.userId = payload.userId;
    return next();
}
