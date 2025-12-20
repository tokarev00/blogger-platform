import { Request, Response } from 'express';
import {PostInputDto} from "../../dto/post.input-dto";
import {PostViewModel} from "../../domain/post";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {PostsService} from "../../application/posts.service";

export async function createPostHandler(req: Request<{}, {}, PostInputDto>, res: Response) {
    const newPost: PostViewModel | null = await PostsService.create(req.body);
    if (!newPost) {
        return res.status(HttpStatus.NotFound)
            .send(
                createErrorMessages([{ field: 'blogId', message: 'Blog not found' }]),
            );
    }
    return res.status(HttpStatus.Created).send(newPost);
}
