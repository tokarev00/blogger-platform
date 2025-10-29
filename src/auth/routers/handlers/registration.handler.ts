import {Request, Response} from "express";
import {AuthService} from "../../application/auth.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";

export const registrationHandler = async (req: Request, res: Response) => {
    const {login, password, email} = req.body as {login: string; password: string; email: string};
    const host = req.get("host") ?? "localhost";
    const baseUrl = `https://${host}`;

    const result = await AuthService.registerUser({login, password, email}, baseUrl);

    if (result.status === "success") {
        res.sendStatus(HttpStatus.NoContent);
        return;
    }

    res.status(HttpStatus.BadRequest).json(createErrorMessages([result.error]));
};
