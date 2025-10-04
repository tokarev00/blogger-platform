import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {UserInputDto} from "../../dto/user.input-dto";
import {UsersService} from "../../application/users.service";

export async function createUserHandler(
    req: Request<{}, {}, UserInputDto>,
    res: Response,
) {
    const result = await UsersService.create(req.body);

    if (result.status === 'error') {
        return res.status(HttpStatus.BadRequest).json(createErrorMessages([result.error]));
    }

    return res.status(HttpStatus.Created).send(result.user);
}
