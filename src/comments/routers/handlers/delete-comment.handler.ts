import {Response} from "express";
import {RequestWithUser} from "../../../auth/types/request-with-user";
import {CommentsService} from "../../application/comments.service";
import {HttpStatus} from "../../../core/types/http-statuses";

export async function deleteCommentHandler(
    req: RequestWithUser<{id: string}>,
    res: Response,
) {
    if (!req.userId) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const result = await CommentsService.delete(req.params.id, req.userId);

    if (result === 'notFound') {
        return res.sendStatus(HttpStatus.NotFound);
    }

    if (result === 'forbidden') {
        return res.sendStatus(HttpStatus.Forbidden);
    }

    return res.sendStatus(HttpStatus.NoContent);
}

