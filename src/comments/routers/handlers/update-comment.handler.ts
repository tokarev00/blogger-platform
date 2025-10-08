import {Response} from "express";
import {RequestWithUser} from "../../../auth/types/request-with-user";
import {CommentInputDto} from "../../dto/comment.input-dto";
import {CommentsService} from "../../application/comments.service";
import {HttpStatus} from "../../../core/types/http-statuses";

export async function updateCommentHandler(
    req: RequestWithUser<{id: string}, {}, CommentInputDto>,
    res: Response,
) {
    if (!req.userId) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const result = await CommentsService.update(req.params.id, req.userId, req.body);

    if (result === 'notFound') {
        return res.sendStatus(HttpStatus.NotFound);
    }

    if (result === 'forbidden') {
        return res.sendStatus(HttpStatus.Forbidden);
    }

    return res.sendStatus(HttpStatus.NoContent);
}

