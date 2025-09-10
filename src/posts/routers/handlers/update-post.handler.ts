import {Request, Response} from "express";
import {PostInputDto} from "../../dto/post.input-dto";
import {PostsRepository} from "../../repositories/posts.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {BlogsRepository} from "../../../blogs/repositories/blogs.repository";

export async function updatePostHandler(req: Request<{ id: string }, {}, PostInputDto>, res: Response) {
    const id = String(req.params.id);
    const post = await PostsRepository.findById(id);
    if (!post) {
        res
            .status(HttpStatus.NotFound)
            .send(
                createErrorMessages([{ field: 'id', message: 'Post not found' }]),
            );
        return;
    }
    const blog  = await BlogsRepository.findById(req.body.blogId);
    if (!blog) {
        return res.status(HttpStatus.NotFound)
            .send(
                createErrorMessages([{ field: 'blogId', message: 'Blog not found' }]),
            );
    }
    await PostsRepository.update(id, {...req.body, blogName: blog.name });

    return res.sendStatus(HttpStatus.NoContent);
}