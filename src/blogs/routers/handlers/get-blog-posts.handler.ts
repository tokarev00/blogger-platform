import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogsRepository} from "../../repositories/blogs.repository";
import {PostsService} from "../../../posts/application/posts.service";
import {parsePaginationQuery} from "../../../core/utils/query";

type BlogPostsQuery = {
    pageNumber?: string | string[];
    pageSize?: string | string[];
    sortBy?: string | string[];
    sortDirection?: string | string[];
};

export async function getBlogPostsHandler(
    req: Request<{id: string}, {}, {}, BlogPostsQuery>,
    res: Response,
) {
    const blog = await BlogsRepository.findById(req.params.id);
    if (!blog) {
        return res.sendStatus(HttpStatus.NotFound);
    }

    const paginationQuery = parsePaginationQuery(req.query, {defaultSortBy: 'createdAt'});
    const posts = await PostsService.findAllByBlogId(req.params.id, paginationQuery);
    return res.status(HttpStatus.Ok).send(posts);
}
