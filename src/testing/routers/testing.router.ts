import {Router, Request, Response} from 'express';
import {HttpStatus} from '../../core/types/http-statuses';
import {
    blogsCollection,
    postsCollection,
    usersCollection,
    commentsCollection,
    commentLikesCollection,
    refreshTokensCollection,
} from '../../db/mongo-db';
import {resetAuthRateLimiter} from "../../auth/middlewares/auth-rate-limit.middleware";

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    await blogsCollection.deleteMany({});
    await postsCollection.deleteMany({});
    await usersCollection.deleteMany({});
    await commentsCollection.deleteMany({});
    await commentLikesCollection.deleteMany({});
    await refreshTokensCollection.deleteMany({});
    resetAuthRateLimiter();
    return res.sendStatus(HttpStatus.NoContent);
});
