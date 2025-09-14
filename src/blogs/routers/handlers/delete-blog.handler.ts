import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {BlogsService} from "../../application/blogs.service";

export async function deleteBlogHandler(req: Request, res: Response) {
    const id = String(req.params.id);
    const isDeleted = await BlogsService.delete(id);
    if (!isDeleted) {
        return res
            .status(HttpStatus.NotFound)
            .send(createErrorMessages([{field: 'id', message: 'Blog not found'}]));
    }
    return res.sendStatus(HttpStatus.NoContent);
}
