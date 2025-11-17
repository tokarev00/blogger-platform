import {Request} from "express";

export type RequestWithSession<
    P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
    Locals extends Record<string, any> = Record<string, any>,
> = Request<P, ResBody, ReqBody, ReqQuery, Locals> & {
    currentUserId?: string;
    currentDeviceId?: string;
    currentSessionTokenId?: string;
};
