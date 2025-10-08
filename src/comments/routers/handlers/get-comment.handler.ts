import {Request, Response} from "express";
import {CommentsService} from "../../application/comments.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {mapCommentToView} from "../../domain/comment";

export async function getCommentHandler(
    req: Request<{id: string}>,
    res: Response,
) {
    const comment = await CommentsService.findById(req.params.id);
    if (!comment) {
        return res.sendStatus(HttpStatus.NotFound);
    }

    return res.status(HttpStatus.Ok).send(mapCommentToView(comment));
}

