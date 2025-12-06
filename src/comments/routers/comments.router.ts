import {Router} from "express";
import {idValidation} from "../../core/middlewares/validation/id-validation.middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {getCommentHandler} from "./handlers/get-comment.handler";
import {bearerAuthGuardMiddleware} from "../../auth/middlewares/bearer-auth.guard-middleware";
import {commentInputValidation} from "../validation/validate-comment-input.middleware";
import {updateCommentHandler} from "./handlers/update-comment.handler";
import {deleteCommentHandler} from "./handlers/delete-comment.handler";
import {likeStatusValidation} from "../validation/validate-like-status.middleware";
import {updateCommentLikeStatusHandler} from "./handlers/update-comment-like-status.handler";

export const commentsRouter = Router();

commentsRouter
    .get(
        '/:id',
        idValidation,
        inputValidationResultMiddleware,
        getCommentHandler,
    )
    .put(
        '/:id',
        idValidation,
        bearerAuthGuardMiddleware,
        commentInputValidation,
        inputValidationResultMiddleware,
        updateCommentHandler,
    )
    .put(
        '/:id/like-status',
        idValidation,
        bearerAuthGuardMiddleware,
        likeStatusValidation,
        inputValidationResultMiddleware,
        updateCommentLikeStatusHandler,
    )
    .delete(
        '/:id',
        idValidation,
        bearerAuthGuardMiddleware,
        inputValidationResultMiddleware,
        deleteCommentHandler,
    );

