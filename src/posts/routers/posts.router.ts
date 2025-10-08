import {Router} from "express";
import {getPostListHandler} from "./handlers/get-post-list.handler";
import {createObjectIdParamValidation, idValidation} from "../../core/middlewares/validation/id-validation.middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {getPostHandler} from "./handlers/get-post.handler";
import {superAdminGuardMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {postInputValidation} from "../validation/validate-post-input.middleware";
import {createPostHandler} from "./handlers/create-post.handler";
import {updatePostHandler} from "./handlers/update-post.handler";
import {deletePostHandler} from "./handlers/delete-post.handler";
import {getPostCommentsHandler} from "../../comments/routers/handlers/get-post-comments.handler";
import {bearerAuthGuardMiddleware} from "../../auth/middlewares/bearer-auth.guard-middleware";
import {commentInputValidation} from "../../comments/validation/validate-comment-input.middleware";
import {createPostCommentHandler} from "../../comments/routers/handlers/create-post-comment.handler";

export const postsRouter = Router();

const postIdValidation = createObjectIdParamValidation('postId');

postsRouter
    .get('/', getPostListHandler)

    .get(
        '/:postId/comments',
        postIdValidation,
        inputValidationResultMiddleware,
        getPostCommentsHandler,
    )

    .get(
        '/:id',
        idValidation,
        inputValidationResultMiddleware,
        getPostHandler
    )

    .post(
        '/',
        superAdminGuardMiddleware,
        postInputValidation,
        inputValidationResultMiddleware,
        createPostHandler
    )

    .post(
        '/:postId/comments',
        postIdValidation,
        bearerAuthGuardMiddleware,
        commentInputValidation,
        inputValidationResultMiddleware,
        createPostCommentHandler,
    )

    .put(
        '/:id',
        idValidation,
        superAdminGuardMiddleware,
        postInputValidation,
        inputValidationResultMiddleware,
        updatePostHandler
    )

    .delete(
        '/:id',
        idValidation,
        superAdminGuardMiddleware,
        inputValidationResultMiddleware,
        deletePostHandler
    );