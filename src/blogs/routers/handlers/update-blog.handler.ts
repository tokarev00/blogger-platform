import {Request, Response} from "express";
import {BlogInputDto} from "../../dto/blog.input-dto";
import {Blog} from "../../types/blog";
import {BlogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";


export function updateBlogHandler(req: Request<{ id: string }, {}, BlogInputDto>, res: Response) {
    const id = String(req.params.id);

    const blog: Blog|null = BlogsRepository.findById(id);

    if (!blog) {
        return res.status(HttpStatus.NotFound)
            .send(
                createErrorMessages([{ field: 'id', message: 'Blog not found' }]),
            );
    }

    BlogsRepository.update(id, req.body);
    
    return res.sendStatus(HttpStatus.NoContent);
}