import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {BlogsRepository} from "../../repositories/blogs.repository";

export async function deleteBlogHandler(req: Request, res: Response) {
    const id = String(req.params.id);
    const blog = await BlogsRepository.findById(id);
    if (!blog) {
        return res
            .status(HttpStatus.NotFound)
            .send(createErrorMessages([{field: 'id', message: 'Blog not found'}]));
    }
    await BlogsRepository.delete(id);
    return res.sendStatus(HttpStatus.NoContent);
}