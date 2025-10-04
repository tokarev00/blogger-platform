import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {UsersService} from "../../application/users.service";

export async function deleteUserHandler(
    req: Request<{id: string}>,
    res: Response,
) {
    const isDeleted = await UsersService.delete(req.params.id);

    if (!isDeleted) {
        return res.sendStatus(HttpStatus.NotFound);
    }

    return res.sendStatus(HttpStatus.NoContent);
}
