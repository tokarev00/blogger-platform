import {PaginationQuery} from "../../core/types/pagination";

export type UsersQuery = PaginationQuery<'createdAt'> & {
    searchLoginTerm?: string;
    searchEmailTerm?: string;
};
