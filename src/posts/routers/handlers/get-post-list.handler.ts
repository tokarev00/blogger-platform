import { Request, Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {PostsService} from "../../application/posts.service";
import {parsePaginationQuery} from "../../../core/utils/query";

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
    const posts = await PostsService.findAll(paginationQuery);
    return res.status(HttpStatus.Ok).send(posts);
}
