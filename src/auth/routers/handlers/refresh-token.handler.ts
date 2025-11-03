import {Request, Response} from "express";
import {AuthService} from "../../application/auth.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {getRefreshTokenFromRequest, setRefreshTokenCookie} from "../helpers/refresh-token-cookie";

export async function refreshTokenHandler(req: Request, res: Response) {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const newTokens = await AuthService.refreshTokens(refreshToken);
    if (!newTokens) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    setRefreshTokenCookie(res, newTokens.refreshToken);
    return res.status(HttpStatus.Ok).send({accessToken: newTokens.accessToken});
}
