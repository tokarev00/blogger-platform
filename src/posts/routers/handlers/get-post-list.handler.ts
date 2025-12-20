import { Request, Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {PostsService} from "../../application/posts.service";
import {parsePaginationQuery} from "../../../core/utils/query";
import {getUserIdFromAuthorizationHeader} from "../../../auth/utils/get-user-id-from-authorization-header";

type PostListQuery = {
    pageNumber?: string | string[];
    pageSize?: string | string[];
    sortBy?: string | string[];
    sortDirection?: string | string[];
};

export async function getPostListHandler(
    req: Request<{}, {}, {}, PostListQuery>,
    res: Response,
) {
    const paginationQuery = parsePaginationQuery(req.query, {defaultSortBy: 'createdAt'});
    const userId = getUserIdFromAuthorizationHeader(req.headers.authorization);
    const posts = await PostsService.findAll(paginationQuery, userId);
    return res.status(HttpStatus.Ok).send(posts);
}
