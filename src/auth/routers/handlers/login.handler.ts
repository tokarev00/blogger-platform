import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {LoginInputDto} from "../../dto/login.input-dto";
import {AuthService} from "../../application/auth.service";

export async function loginHandler(
    req: Request<{}, {}, LoginInputDto>,
    res: Response,
) {
    const isValid = await AuthService.verifyCredentials(
        req.body.loginOrEmail,
        req.body.password,
    );

    if (!isValid) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    return res.sendStatus(HttpStatus.NoContent);
}
