import {Router} from "express";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {loginValidation} from "../validation/login-validation.middleware";
import {loginHandler} from "./handlers/login.handler";
import {bearerAuthGuardMiddleware} from "../middlewares/bearer-auth.guard-middleware";
import {getMeHandler} from "./handlers/get-me.handler";
import {registrationConfirmationValidation} from "../validation/registration-confirmation-validation.middleware";
import {registrationConfirmationHandler} from "./handlers/registration-confirmation.handler";
import {registrationEmailResendingValidation} from "../validation/registration-email-resending-validation.middleware";
import {registrationEmailResendingHandler} from "./handlers/registration-email-resending.handler";

export const authRouter = Router();

authRouter.post(
    '/login',
    loginValidation,
    inputValidationResultMiddleware,
    loginHandler,
);

authRouter.post(
    '/registration-confirmation',
    registrationConfirmationValidation,
    inputValidationResultMiddleware,
    registrationConfirmationHandler,
);

authRouter.post(
    '/registration-email-resending',
    registrationEmailResendingValidation,
    inputValidationResultMiddleware,
    registrationEmailResendingHandler,
);

authRouter.get(
    '/me',
    bearerAuthGuardMiddleware,
    getMeHandler,
);
