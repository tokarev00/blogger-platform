import { Request, Response } from 'express';
import {PostInputDto} from "../../dto/post.input-dto";
import {Post} from "../../types/post";
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {PostsService} from "../../application/posts.service";

export async function createPostHandler(req: Request<{}, {}, PostInputDto>, res: Response) {
    const newPost: Post | null = await PostsService.create(req.body);
    if (!newPost) {
        return res.status(HttpStatus.NotFound)
            .send(
                createErrorMessages([{ field: 'blogId', message: 'Blog not found' }]),
            );
    }
    return res.status(HttpStatus.Created).send(newPost);
}
