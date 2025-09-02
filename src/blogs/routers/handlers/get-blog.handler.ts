import {Request, Response} from "express";
import {BlogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";


export function getBlogHandler(req: Request, res: Response) {
    const id = String(req.params.id);
    const blog = BlogsRepository.findById(id);

    if (!blog) {
        return res
            .status(HttpStatus.NotFound)
            .send(createErrorMessages([{field: 'id', message: 'Blog not found'}]));
    }
    return res.send(blog);
}