import {Router} from "express";
import {idValidation} from "../../core/middlewares/validation/id-validation.middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {getCommentHandler} from "./handlers/get-comment.handler";
import {bearerAuthGuardMiddleware} from "../../auth/middlewares/bearer-auth.guard-middleware";
import {commentInputValidation} from "../validation/validate-comment-input.middleware";
import {updateCommentHandler} from "./handlers/update-comment.handler";
import {deleteCommentHandler} from "./handlers/delete-comment.handler";

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
    .delete(
        '/:id',
        idValidation,
        bearerAuthGuardMiddleware,
        inputValidationResultMiddleware,
        deleteCommentHandler,
    );

