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

export const blogsRouter = Router();


blogsRouter
    .get('/', getBlogListHandler)

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
