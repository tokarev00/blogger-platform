export type SortDirection = 'asc' | 'desc';

export type PaginationQuery<TSortBy extends string = string> = {
    pageNumber: number;
    pageSize: number;
    sortBy: TSortBy;
    sortDirection: SortDirection;
};

export type Paginator<T> = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: T[];
};
