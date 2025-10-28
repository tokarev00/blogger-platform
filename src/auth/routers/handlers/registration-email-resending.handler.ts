import {Request, Response} from "express";
import {AuthService} from "../../application/auth.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";

export const registrationEmailResendingHandler = async (req: Request, res: Response) => {
    const {email} = req.body as {email: string};
    const host = req.get("host") ?? "localhost";
    const baseUrl = `https://${host}`;

    const result = await AuthService.resendRegistrationEmail(email, baseUrl);

    if (result === "success") {
        res.sendStatus(HttpStatus.NoContent);
        return;
    }

    const message =
        result === "alreadyConfirmed"
            ? "email has already been confirmed"
            : "user with this email does not exist";

    res.status(HttpStatus.BadRequest).json(createErrorMessages([{field: "email", message}]));
};
