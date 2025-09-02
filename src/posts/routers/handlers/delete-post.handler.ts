import {Request, Response} from "express";
import {PostsRepository} from "../../repositories/posts.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";

export function deletePostHandler(req: Request, res: Response) {
    const id = String(req.params.id);
    const post = PostsRepository.findById(id);
    if (!post) {
        return res
            .status(HttpStatus.NotFound)
            .send(createErrorMessages([{field: 'id', message: 'Post not found'}]));
    }
    PostsRepository.delete(id);
    return res.status(HttpStatus.NoContent);
}