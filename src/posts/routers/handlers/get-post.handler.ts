import { Request, Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {PostsService} from "../../application/posts.service";

export async function getPostHandler(req: Request, res: Response) {
    const id = String(req.params.id);
    const post = await PostsService.findById(id);
    if (!post) {
        return res
            .status(HttpStatus.NotFound)
            .send(createErrorMessages([{field: 'id', message: 'Post not found'}]));
    }
    return res.send(post);
}
