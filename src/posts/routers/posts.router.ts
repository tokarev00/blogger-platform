import {Router} from "express";
import {getPostListHandler} from "./handlers/get-post-list.handler";
import {idValidation} from "../../core/middlewares/validation/id-validation.middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {getPostHandler} from "./handlers/get-post.handler";
import {superAdminGuardMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {postInputValidation} from "../validation/validate-post-input.middleware";
import {createPostHandler} from "./handlers/create-post.handler";
import {updatePostHandler} from "./handlers/update-post.handler";
import {deletePostHandler} from "./handlers/delete-post.handler";

export const postsRouter = Router();

postsRouter
    .get('/', getPostListHandler)

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