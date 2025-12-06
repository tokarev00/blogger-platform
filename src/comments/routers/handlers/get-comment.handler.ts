import {Request, Response} from "express";
import {CommentsService} from "../../application/comments.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {getUserIdFromAuthorizationHeader} from "../../../auth/utils/get-user-id-from-authorization-header";

export async function getCommentHandler(
    req: Request<{id: string}>,
    res: Response,
) {
    const userId = getUserIdFromAuthorizationHeader(req.headers.authorization);
    const comment = await CommentsService.findViewById(req.params.id, userId);
    if (!comment) {
        return res.sendStatus(HttpStatus.NotFound);
    }

    return res.status(HttpStatus.Ok).send(comment);
}

