import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {LoginInputDto} from "../../dto/login.input-dto";
import {AuthService} from "../../application/auth.service";

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

    const accessToken = AuthService.createAccessToken(user.id);

    return res.status(HttpStatus.Ok).send({accessToken});
}
