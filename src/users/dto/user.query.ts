import {PaginationQuery} from "../../core/types/pagination";

export type UserSortBy = 'createdAt' | 'login' | 'email';

export type UsersQuery = PaginationQuery<UserSortBy> & {
    searchLoginTerm?: string;
    searchEmailTerm?: string;
};
