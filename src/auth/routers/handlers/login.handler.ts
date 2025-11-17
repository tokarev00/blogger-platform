import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {LoginInputDto} from "../../dto/login.input-dto";
import {AuthService} from "../../application/auth.service";
import {setRefreshTokenCookie} from "../helpers/refresh-token-cookie";
import {buildDeviceTitle} from "../../../core/utils/device-title";

export async function loginHandler(
    req: Request<{}, {}, LoginInputDto>,
    res: Response,
) {
    const user = await AuthService.validateCredentials(
        req.body.loginOrEmail,
        req.body.password,
    );

    if (!user) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgentHeader = req.headers['user-agent'];
    const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader;
    const title = buildDeviceTitle(userAgent);

    const tokens = await AuthService.createSession(user.id, {ip: clientIp, title});

    setRefreshTokenCookie(res, tokens.refreshToken);

    return res.status(HttpStatus.Ok).send({accessToken: tokens.accessToken});
}
