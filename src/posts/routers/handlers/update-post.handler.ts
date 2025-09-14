import {Request, Response} from "express";
import {PostInputDto} from "../../dto/post.input-dto";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {PostsService} from "../../application/posts.service";

export async function updatePostHandler(req: Request<{ id: string }, {}, PostInputDto>, res: Response) {
    const id = String(req.params.id);
    const result = await PostsService.update(id, req.body);
    if (result === 'postNotFound') {
        return res
            .status(HttpStatus.NotFound)
            .send(
                createErrorMessages([{ field: 'id', message: 'Post not found' }]),
            );
    }
    if (result === 'blogNotFound') {
        return res.status(HttpStatus.NotFound)
            .send(
                createErrorMessages([{ field: 'blogId', message: 'Blog not found' }]),
            );
    }
    return res.sendStatus(HttpStatus.NoContent);
}
