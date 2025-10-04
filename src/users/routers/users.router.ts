import {Router} from "express";
import {superAdminGuardMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {idValidation} from "../../core/middlewares/validation/id-validation.middleware";
import {getUserListHandler} from "./handlers/get-user-list.handler";
import {createUserHandler} from "./handlers/create-user.handler";
import {deleteUserHandler} from "./handlers/delete-user.handler";
import {userInputValidation} from "../validation/validate-user-input.middleware";

export const usersRouter = Router();

usersRouter
    .get('/', superAdminGuardMiddleware, getUserListHandler)
    .post(
        '/',
        superAdminGuardMiddleware,
        userInputValidation,
        inputValidationResultMiddleware,
        createUserHandler,
    )
    .delete(
        '/:id',
        idValidation,
        superAdminGuardMiddleware,
        inputValidationResultMiddleware,
        deleteUserHandler,
    );
