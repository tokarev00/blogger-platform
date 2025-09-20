import {PaginationQuery, SortDirection} from '../types/pagination';

type QueryValue = string | string[] | undefined | null;

type QueryRecord = Partial<Record<string, QueryValue>>;

function getStringFromValue(value: QueryValue): string | undefined {
    if (typeof value === 'string') {
        return value;
    }
    if (Array.isArray(value) && value.length > 0) {
        const first = value[0];
        return typeof first === 'string' ? first : undefined;
    }
    return undefined;
}

function parseNumber(value: QueryValue, defaultValue: number, minValue: number): number {
    const str = getStringFromValue(value);
    if (!str) {
        return defaultValue;
    }
    const num = Number(str);
    if (!Number.isFinite(num)) {
        return defaultValue;
    }
    const integer = Math.floor(num);
    if (integer < minValue) {
        return defaultValue;
    }
    return integer;
}

function parseSortDirection(value: QueryValue, defaultValue: SortDirection): SortDirection {
    const str = getStringFromValue(value)?.toLowerCase();
    if (str === 'asc' || str === 'desc') {
        return str;
    }
    return defaultValue;
}

function parseSortBy(value: QueryValue, defaultValue: string): string {
    const str = getStringFromValue(value);
    if (!str) {
        return defaultValue;
    }
    const trimmed = str.trim();
    return trimmed.length > 0 ? trimmed : defaultValue;
}

export function parsePaginationQuery(
    query: QueryRecord,
    options?: {
        defaultPageNumber?: number;
        defaultPageSize?: number;
        defaultSortBy?: string;
        defaultSortDirection?: SortDirection;
    },
): PaginationQuery<string> {
    const defaultPageNumber = options?.defaultPageNumber ?? 1;
    const defaultPageSize = options?.defaultPageSize ?? 10;
    const defaultSortBy = options?.defaultSortBy ?? 'createdAt';
    const defaultSortDirection = options?.defaultSortDirection ?? 'desc';

    const pageNumber = parseNumber(query.pageNumber, defaultPageNumber, 1);
    const pageSize = parseNumber(query.pageSize, defaultPageSize, 1);
    const sortBy = parseSortBy(query.sortBy, defaultSortBy);
    const sortDirection = parseSortDirection(query.sortDirection, defaultSortDirection);

    return {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
    };
}

export function getSearchTerm(value: QueryValue): string | undefined {
    const str = getStringFromValue(value);
    if (!str) {
        return undefined;
    }
    const trimmed = str.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
