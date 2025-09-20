import { Request, Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {PostsService} from "../../application/posts.service";

export async function getPostListHandler(req: Request, res: Response) {
    const posts = await PostsService.findAll();
    return res.status(HttpStatus.Ok).send(posts);
}
