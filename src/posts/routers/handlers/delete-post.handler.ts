import {Request, Response} from "express";
import {PostsRepository} from "../../repositories/posts.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";

export async function deletePostHandler(req: Request, res: Response) {
    const id = String(req.params.id);
    const post = await PostsRepository.findById(id);
    if (!post) {
        return res
            .status(HttpStatus.NotFound)
            .send(createErrorMessages([{field: 'id', message: 'Post not found'}]));
    }
    await PostsRepository.delete(id);
    return res.sendStatus(HttpStatus.NoContent);
}