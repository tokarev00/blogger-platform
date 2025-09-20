import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogsRepository} from "../../repositories/blogs.repository";
import {PostsService} from "../../../posts/application/posts.service";

export async function getBlogPostsHandler(
    req: Request<{id: string}>,
    res: Response,
) {
    const blog = await BlogsRepository.findById(req.params.id);
    if (!blog) {
        return res.sendStatus(HttpStatus.NotFound);
    }

    const posts = await PostsService.findAllByBlogId(req.params.id);
    return res.status(HttpStatus.Ok).send(posts);
}
