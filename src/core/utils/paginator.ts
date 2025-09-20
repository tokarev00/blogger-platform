import {Paginator} from '../types/pagination';

export function buildPaginator<T>(
    items: T[],
    totalCount: number,
    pageNumber: number,
    pageSize: number,
): Paginator<T> {
    const pagesCount = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
    return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items,
    };
}
