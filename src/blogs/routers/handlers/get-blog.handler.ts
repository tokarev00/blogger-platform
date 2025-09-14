import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {BlogsService} from "../../application/blogs.service";

export async function getBlogHandler(req: Request, res: Response) {
    const id = String(req.params.id);
    const blog = await BlogsService.findById(id);
    if (!blog) {
        return res
            .status(HttpStatus.NotFound)
            .send(createErrorMessages([{field: 'id', message: 'Blog not found'}]));
    }
    return res.send(blog);
}
