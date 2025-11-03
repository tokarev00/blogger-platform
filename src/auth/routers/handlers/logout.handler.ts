import {Request, Response} from "express";
import {AuthService} from "../../application/auth.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {clearRefreshTokenCookie, getRefreshTokenFromRequest} from "../helpers/refresh-token-cookie";

export async function logoutHandler(req: Request, res: Response) {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const isLoggedOut = await AuthService.logout(refreshToken);
    if (!isLoggedOut) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    clearRefreshTokenCookie(res);
    return res.sendStatus(HttpStatus.NoContent);
}
