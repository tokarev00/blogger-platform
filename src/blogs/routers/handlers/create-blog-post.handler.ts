import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {PostsService} from "../../../posts/application/posts.service";
import {PostForBlogInputDto} from "../../../posts/dto/post-for-blog.input-dto";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";

export async function createBlogPostHandler(
    req: Request<{id: string}, {}, PostForBlogInputDto>,
    res: Response,
) {
    const newPost = await PostsService.createForBlog(req.params.id, req.body);
    if (!newPost) {
        return res
            .status(HttpStatus.NotFound)
            .send(createErrorMessages([{field: "id", message: "Blog not found"}]));
    }

    return res.status(HttpStatus.Created).send(newPost);
}
