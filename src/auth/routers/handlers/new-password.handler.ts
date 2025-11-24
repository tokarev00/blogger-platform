import {Request, Response} from "express";
import {AuthService} from "../../application/auth.service";
import {HttpStatus} from "../../../core/types/http-statuses";

export const newPasswordHandler = async (req: Request, res: Response) => {
    const {newPassword, recoveryCode} = req.body as {newPassword: string; recoveryCode: string};
    const result = await AuthService.confirmPasswordRecovery(recoveryCode, newPassword);

    if (result === 'success') {
        res.sendStatus(HttpStatus.NoContent);
        return;
    }

    res.sendStatus(HttpStatus.BadRequest);
};
