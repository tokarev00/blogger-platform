import {Response} from "express";
import {RequestWithUser} from "../../../auth/types/request-with-user";
import {HttpStatus} from "../../../core/types/http-statuses";
import {PostsService} from "../../application/posts.service";
import {PostLikeStatus} from "../../domain/post-like";

type UpdateLikeStatusRequest = RequestWithUser<{postId: string}, {}, {likeStatus: PostLikeStatus}>;

export async function updatePostLikeStatusHandler(
    req: UpdateLikeStatusRequest,
    res: Response,
) {
    if (!req.userId) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const result = await PostsService.updateLikeStatus(req.params.postId, req.userId, req.body.likeStatus);
    if (result === 'notFound') {
        return res.sendStatus(HttpStatus.NotFound);
    }
    if (result === 'userNotFound') {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    return res.sendStatus(HttpStatus.NoContent);
}
