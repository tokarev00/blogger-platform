import {Request} from "express";

type RequestWithUser<TParams = any, TResBody = any, TReqBody = any, TQuery = any> = Request<
    TParams,
    TResBody,
    TReqBody,
    TQuery
> & {
    userId?: string;
};

export type {RequestWithUser};

