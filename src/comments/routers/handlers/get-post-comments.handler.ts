import {Request, Response} from "express";
import {parsePaginationQuery} from "../../../core/utils/query";
import {HttpStatus} from "../../../core/types/http-statuses";
import {CommentsService} from "../../application/comments.service";
import {mapCommentToView} from "../../domain/comment";
import {PostsService} from "../../../posts/application/posts.service";

export type PostCommentsQuery = {
    pageNumber?: string | string[];
    pageSize?: string | string[];
    sortBy?: string | string[];
    sortDirection?: string | string[];
};

export async function getPostCommentsHandler(
    req: Request<{postId: string}, {}, {}, PostCommentsQuery>,
    res: Response,
) {
    const post = await PostsService.findById(req.params.postId);
    if (!post) {
        return res.sendStatus(HttpStatus.NotFound);
    }

    const paginationQuery = parsePaginationQuery(req.query, {defaultSortBy: 'createdAt'});
    const comments = await CommentsService.findAllByPostId(req.params.postId, paginationQuery);

    return res.status(HttpStatus.Ok).send({
        ...comments,
        items: comments.items.map(mapCommentToView),
    });
}

