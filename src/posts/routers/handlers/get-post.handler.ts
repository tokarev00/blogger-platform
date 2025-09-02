import { Request, Response } from 'express';
import {PostsRepository} from "../../repositories/posts.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";

export function getPostHandler(req: Request, res: Response) {
    const id = String(req.params.id);
    const post = PostsRepository.findById(id);
    if (!post) {
        return res
            .status(HttpStatus.NotFound)
            .send(createErrorMessages([{field: 'id', message: 'Post not found'}]));
    }
    return res.send(post);
}