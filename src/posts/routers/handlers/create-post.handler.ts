import { Request, Response } from 'express';
import {PostInputDto} from "../../dto/post.input-dto";
import {Post} from "../../types/post";
import {PostsRepository} from "../../repositories/posts.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogsRepository} from "../../../blogs/repositories/blogs.repository";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";


export async function createPostHandler(req: Request<{}, {}, PostInputDto>, res: Response) {
    const blog  = await BlogsRepository.findById(req.body.blogId);
    if (!blog) {
            return res.status(HttpStatus.NotFound)
            .send(
                createErrorMessages([{ field: 'blogId', message: 'Blog not found' }]),
            );
    }
    const newPostData = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: req.body.blogId,
        blogName: blog.name
    };
    const newPost: Post = await PostsRepository.create(newPostData);
    return res.status(HttpStatus.Created).send(newPost);
}