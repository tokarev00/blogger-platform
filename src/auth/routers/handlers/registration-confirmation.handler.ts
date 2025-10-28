import {Request, Response} from "express";
import {AuthService} from "../../application/auth.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";

export const registrationConfirmationHandler = async (req: Request, res: Response) => {
    const {code} = req.body as {code: string};

    const isConfirmed = await AuthService.confirmRegistration(code);
    if (isConfirmed) {
        res.sendStatus(HttpStatus.NoContent);
        return;
    }

    res
        .status(HttpStatus.BadRequest)
        .json(createErrorMessages([{field: "code", message: "confirmation code is invalid or expired"}]));
};
