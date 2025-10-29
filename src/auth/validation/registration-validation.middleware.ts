import {body} from "express-validator";

export const registrationValidation = [
    body('login')
        .exists()
        .withMessage('login is required')
        .bail()
        .isString()
        .withMessage('login must be a string')
        .bail()
        .trim()
        .isLength({min: 3, max: 10})
        .withMessage('login length should be between 3 and 10 characters')
        .bail()
        .matches(/^[a-zA-Z0-9_-]*$/)
        .withMessage('login has invalid format'),
    body('password')
        .exists()
        .withMessage('password is required')
        .bail()
        .isString()
        .withMessage('password must be a string')
        .bail()
        .isLength({min: 6, max: 20})
        .withMessage('password length should be between 6 and 20 characters'),
    body('email')
        .exists()
        .withMessage('email is required')
        .bail()
        .isString()
        .withMessage('email must be a string')
        .bail()
        .trim()
        .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
        .withMessage('email has invalid format'),
];
