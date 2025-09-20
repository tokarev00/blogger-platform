import {PaginationQuery} from '../../core/types/pagination';

export type BlogsQuery = PaginationQuery<string> & {
    searchNameTerm?: string;
};
