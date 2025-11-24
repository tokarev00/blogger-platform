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
import {registrationValidation} from "../validation/registration-validation.middleware";
import {registrationHandler} from "./handlers/registration.handler";
import {refreshTokenHandler} from "./handlers/refresh-token.handler";
import {logoutHandler} from "./handlers/logout.handler";
import {authRateLimitMiddleware} from "../middlewares/auth-rate-limit.middleware";
import {passwordRecoveryHandler} from "./handlers/password-recovery.handler";
import {passwordRecoveryValidation} from "../validation/password-recovery-validation.middleware";
import {newPasswordValidation} from "../validation/new-password-validation.middleware";
import {newPasswordHandler} from "./handlers/new-password.handler";

export const authRouter = Router();

authRouter.post(
    '/login',
    authRateLimitMiddleware,
    loginValidation,
    inputValidationResultMiddleware,
    loginHandler,
);

authRouter.post(
    '/refresh-token',
    refreshTokenHandler,
);

authRouter.post(
    '/logout',
    logoutHandler,
);

authRouter.post(
    '/registration',
    authRateLimitMiddleware,
    registrationValidation,
    inputValidationResultMiddleware,
    registrationHandler,
);

authRouter.post(
    '/registration-confirmation',
    authRateLimitMiddleware,
    registrationConfirmationValidation,
    inputValidationResultMiddleware,
    registrationConfirmationHandler,
);

authRouter.post(
    '/registration-email-resending',
    authRateLimitMiddleware,
    registrationEmailResendingValidation,
    inputValidationResultMiddleware,
    registrationEmailResendingHandler,
);

authRouter.get(
    '/me',
    bearerAuthGuardMiddleware,
    getMeHandler,
);

authRouter.post(
    '/password-recovery',
    authRateLimitMiddleware,
    passwordRecoveryValidation,
    inputValidationResultMiddleware,
    passwordRecoveryHandler,
);

authRouter.post(
    '/new-password',
    authRateLimitMiddleware,
    newPasswordValidation,
    inputValidationResultMiddleware,
    newPasswordHandler,
);
