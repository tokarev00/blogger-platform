import {Router} from "express";
import {getBlogListHandler} from "./handlers/get-blog-list.handler";
import {getBlogHandler} from "./handlers/get-blog.handler";
import {idValidation} from "../../core/middlewares/validation/id-validation.middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {superAdminGuardMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {blogInputValidation} from "../validation/validate-blog-input.middleware";
import {createBlogHandler} from "./handlers/create-blog.handler";
import {updateBlogHandler} from "./handlers/update-blog.handler";
import {deleteBlogHandler} from "./handlers/delete-blog.handler";
import {getBlogPostsHandler} from "./handlers/get-blog-posts.handler";
import {postForBlogInputValidation} from "../../posts/validation/validate-post-for-blog-input.middleware";
import {createBlogPostHandler} from "./handlers/create-blog-post.handler";

export const blogsRouter = Router();


blogsRouter
    .get('/', getBlogListHandler)

    .get(
        '/:id/posts',
        idValidation,
        inputValidationResultMiddleware,
        getBlogPostsHandler,
    )

    .get(
        '/:id',
        idValidation,
        inputValidationResultMiddleware,
        getBlogHandler
    )

    .post('/',
        superAdminGuardMiddleware,
        blogInputValidation,
        inputValidationResultMiddleware,
        createBlogHandler
    )
    .post(
        '/:id/posts',
        superAdminGuardMiddleware,
        idValidation,
        postForBlogInputValidation,
        inputValidationResultMiddleware,
        createBlogPostHandler,
    )
    .put(
        '/:id',
        superAdminGuardMiddleware,
        idValidation,
        blogInputValidation,
        inputValidationResultMiddleware,
        updateBlogHandler
    )

    .delete(
        '/:id',
        idValidation,
        superAdminGuardMiddleware,
        inputValidationResultMiddleware,
        deleteBlogHandler
    );
