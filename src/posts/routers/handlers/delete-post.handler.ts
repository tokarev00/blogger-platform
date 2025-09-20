import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {PostsService} from "../../application/posts.service";

export async function deletePostHandler(req: Request, res: Response) {
    const id = String(req.params.id);
    const isDeleted = await PostsService.delete(id);
    if (!isDeleted) {
        return res
            .status(HttpStatus.NotFound)
            .send(createErrorMessages([{field: 'id', message: 'Post not found'}]));
    }
    return res.sendStatus(HttpStatus.NoContent);
}
