import { Router, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import {blogsCollection, postsCollection, usersCollection, commentsCollection} from '../../db/mongo-db';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    await blogsCollection.deleteMany({});
    await postsCollection.deleteMany({});
    await usersCollection.deleteMany({});
    await commentsCollection.deleteMany({});
    return  res.sendStatus(HttpStatus.NoContent);
});
