import {FieldError} from "../../types/field-error";
import {ResultError} from "../../types/result-error";
import {FieldValidationError, ValidationError, validationResult} from "express-validator";
import {NextFunction, Response, Request} from "express";
import {HttpStatus} from "../../types/http-statuses";

export const createErrorMessages = (errors: FieldError[]): ResultError => {
    return {errorsMessages: errors};
}

const formatError = (error: ValidationError): FieldError => {
    const expressError = error as unknown as FieldValidationError;
    return {
        field: expressError.path,
        message: expressError.msg,
    };
}
export const inputValidationResultMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const errors = validationResult(req).formatWith(formatError).array({ onlyFirstError: true });

    if (errors.length > 0) {
        res.status(HttpStatus.BadRequest).json({ errorsMessages: errors });
        return;
    }

    next();
};