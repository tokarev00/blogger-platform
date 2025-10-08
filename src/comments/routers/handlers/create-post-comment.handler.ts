import {Response} from "express";
import {RequestWithUser} from "../../../auth/types/request-with-user";
import {CommentInputDto} from "../../dto/comment.input-dto";
import {CommentsService} from "../../application/comments.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {mapCommentToView} from "../../domain/comment";

export async function createPostCommentHandler(
    req: RequestWithUser<{postId: string}, {}, CommentInputDto>,
    res: Response,
) {
    if (!req.userId) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const result = await CommentsService.createForPost(req.params.postId, req.userId, req.body.content);

    if (result === 'postNotFound') {
        return res.sendStatus(HttpStatus.NotFound);
    }

    if (result === 'userNotFound') {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    return res.status(HttpStatus.Created).send(mapCommentToView(result));
}

