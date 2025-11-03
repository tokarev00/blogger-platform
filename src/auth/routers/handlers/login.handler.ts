import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {LoginInputDto} from "../../dto/login.input-dto";
import {AuthService} from "../../application/auth.service";
import {setRefreshTokenCookie} from "../helpers/refresh-token-cookie";

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

    const tokens = await AuthService.createTokenPair(user.id);

    setRefreshTokenCookie(res, tokens.refreshToken);

    return res.status(HttpStatus.Ok).send({accessToken: tokens.accessToken});
}
