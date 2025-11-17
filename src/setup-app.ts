import express, {Express} from "express";
import {
    AUTH_PATH,
    BLOGS_PATH,
    COMMENTS_PATH,
    POSTS_PATH,
    TESTING_PATH,
    USERS_PATH,
    SECURITY_DEVICES_PATH,
} from "./core/paths/paths";
import {testingRouter} from "./testing/routers/testing.router";
import {blogsRouter} from "./blogs/routers/blog-router";
import {postsRouter} from "./posts/routers/posts.router";
import {usersRouter} from "./users/routers/users.router";
import {authRouter} from "./auth/routers/auth.router";
import {commentsRouter} from "./comments/routers/comments.router";
import {securityDevicesRouter} from "./security/routers/security-devices.router";
export const setupApp = (app: Express) => {
    app.use(express.json());

    app.get('/', (req, res) => {
        res.status(200).send('hello world!!!');
    });

    app.use(BLOGS_PATH, blogsRouter);
    app.use(POSTS_PATH, postsRouter);
    app.use(USERS_PATH, usersRouter);
    app.use(AUTH_PATH, authRouter);
    app.use(COMMENTS_PATH, commentsRouter);
    app.use(SECURITY_DEVICES_PATH, securityDevicesRouter);
    app.use(TESTING_PATH, testingRouter);

    return app;
};