import {Router} from "express";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {loginValidation} from "../validation/login-validation.middleware";
import {loginHandler} from "./handlers/login.handler";
import {bearerAuthGuardMiddleware} from "../middlewares/bearer-auth.guard-middleware";
import {getMeHandler} from "./handlers/get-me.handler";

export const authRouter = Router();

authRouter.post(
    '/login',
    loginValidation,
    inputValidationResultMiddleware,
    loginHandler,
);

authRouter.get(
    '/me',
    bearerAuthGuardMiddleware,
    getMeHandler,
);
