import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {AuthService} from "../../application/auth.service";

export const passwordRecoveryHandler = async (req: Request, res: Response) => {
    const {email} = req.body as {email: string};
    await AuthService.requestPasswordRecovery(email);
    res.sendStatus(HttpStatus.NoContent);
};
