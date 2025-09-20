import {Request, Response} from "express";
import {BlogInputDto} from "../../dto/blog.input-dto";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {BlogsService} from "../../application/blogs.service";

export async function updateBlogHandler(req: Request<{ id: string }, {}, BlogInputDto>, res: Response) {
    const id = String(req.params.id);
    const isUpdated = await BlogsService.update(id, req.body);
    if (!isUpdated) {
        return res.status(HttpStatus.NotFound)
            .send(
                createErrorMessages([{ field: 'id', message: 'Blog not found' }]),
            );
    }
    return res.sendStatus(HttpStatus.NoContent);
}
