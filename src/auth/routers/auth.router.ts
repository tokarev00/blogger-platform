import {Router} from "express";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {loginValidation} from "../validation/login-validation.middleware";
import {loginHandler} from "./handlers/login.handler";

export const authRouter = Router();

authRouter.post(
    '/login',
    loginValidation,
    inputValidationResultMiddleware,
    loginHandler,
);
