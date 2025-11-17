import {Request, Response, NextFunction} from "express";
import {HttpStatus} from "../../core/types/http-statuses";
import {getRefreshTokenFromRequest} from "../routers/helpers/refresh-token-cookie";
import {AuthService} from "../application/auth.service";

export async function refreshTokenGuardMiddleware(req: Request, res: Response, next: NextFunction) {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const session = await AuthService.getSessionByRefreshToken(refreshToken);
    if (!session) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    req.currentUserId = session.userId;
    req.currentDeviceId = session.deviceId;
    req.currentSessionTokenId = session.tokenId;

    return next();
}
