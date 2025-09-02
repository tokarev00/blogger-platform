import { Request, Response } from 'express';
import {PostsRepository} from "../../repositories/posts.repository";
import {HttpStatus} from "../../../core/types/http-statuses";

export function getPostListHandler(req: Request, res: Response) {
    const posts = PostsRepository.findAll()
    return res.status(HttpStatus.Ok).send(posts);
}