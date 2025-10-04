import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {parsePaginationQuery, getSearchTerm} from "../../../core/utils/query";
import {UsersService} from "../../application/users.service";
import {UsersQuery} from "../../dto/user.query";

type UserListQuery = {
    pageNumber?: string | string[];
    pageSize?: string | string[];
    sortBy?: string | string[];
    sortDirection?: string | string[];
    searchLoginTerm?: string | string[];
    searchEmailTerm?: string | string[];
};

export async function getUserListHandler(
    req: Request<{}, {}, {}, UserListQuery>,
    res: Response,
) {
    const paginationQuery = parsePaginationQuery(req.query, {defaultSortBy: 'createdAt'});
    const searchLoginTerm = getSearchTerm(req.query.searchLoginTerm);
    const searchEmailTerm = getSearchTerm(req.query.searchEmailTerm);

    const usersQuery: UsersQuery = {
        ...paginationQuery,
        sortBy: 'createdAt',
        searchLoginTerm,
        searchEmailTerm,
    };

    const users = await UsersService.findAll(usersQuery);
    return res.status(HttpStatus.Ok).send(users);
}
