import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogsService} from "../../application/blogs.service";
import {parsePaginationQuery, getSearchTerm} from "../../../core/utils/query";

type BlogListQuery = {
    searchNameTerm?: string | string[];
    pageNumber?: string | string[];
    pageSize?: string | string[];
    sortBy?: string | string[];
    sortDirection?: string | string[];
};

export async function getBlogListHandler(
    req: Request<{}, {}, {}, BlogListQuery>,
    res: Response,
) {
    const paginationQuery = parsePaginationQuery(req.query, {defaultSortBy: 'createdAt'});
    const searchNameTerm = getSearchTerm(req.query.searchNameTerm);

    const blogs = await BlogsService.findAll({
        ...paginationQuery,
        searchNameTerm,
    });
    return res.status(HttpStatus.Ok).send(blogs);
}
