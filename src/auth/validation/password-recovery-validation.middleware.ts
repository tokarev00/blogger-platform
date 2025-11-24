import {body} from "express-validator";

export const passwordRecoveryValidation = [
    body('email')
        .exists()
        .withMessage('email is required')
        .bail()
        .isString()
        .withMessage('email must be a string')
        .bail()
        .trim()
        .isEmail()
        .withMessage('email has invalid format'),
];
