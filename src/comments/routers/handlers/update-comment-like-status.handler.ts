import {Response} from "express";
import {RequestWithUser} from "../../../auth/types/request-with-user";
import {HttpStatus} from "../../../core/types/http-statuses";
import {CommentsService} from "../../application/comments.service";
import {CommentLikeStatus} from "../../domain/comment-like";

type UpdateLikeStatusRequest = RequestWithUser<{id: string}, {}, {likeStatus: CommentLikeStatus}>;

export async function updateCommentLikeStatusHandler(
    req: UpdateLikeStatusRequest,
    res: Response,
) {
    if (!req.userId) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const result = await CommentsService.updateLikeStatus(req.params.id, req.userId, req.body.likeStatus);
    if (result === 'notFound') {
        return res.sendStatus(HttpStatus.NotFound);
    }

    return res.sendStatus(HttpStatus.NoContent);
}

