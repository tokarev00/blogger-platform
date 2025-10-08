import {Response} from "express";
import {RequestWithUser} from "../../types/request-with-user";
import {AuthService} from "../../application/auth.service";
import {HttpStatus} from "../../../core/types/http-statuses";

export async function getMeHandler(req: RequestWithUser, res: Response) {
    const userId = req.userId;
    if (!userId) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const user = await AuthService.getUserById(userId);
    if (!user) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    return res.status(HttpStatus.Ok).send({
        email: user.email,
        login: user.login,
        userId: user.id,
    });
}
