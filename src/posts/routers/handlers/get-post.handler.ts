import { Request, Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {createErrorMessages} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {PostsService} from "../../application/posts.service";
import {getUserIdFromAuthorizationHeader} from "../../../auth/utils/get-user-id-from-authorization-header";

export async function getPostHandler(req: Request, res: Response) {
    const id = String(req.params.id);
    const userId = getUserIdFromAuthorizationHeader(req.headers.authorization);
    const post = await PostsService.findById(id, userId);
    if (!post) {
        return res
            .status(HttpStatus.NotFound)
            .send(createErrorMessages([{field: 'id', message: 'Post not found'}]));
    }
    return res.send(post);
}
