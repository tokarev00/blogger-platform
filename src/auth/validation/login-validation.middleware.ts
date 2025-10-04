import {body} from "express-validator";

export const loginValidation = [
    body('loginOrEmail')
        .exists()
        .withMessage('loginOrEmail is required')
        .bail()
        .isString()
        .withMessage('loginOrEmail must be a string')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('loginOrEmail should not be empty'),
    body('password')
        .exists()
        .withMessage('password is required')
        .bail()
        .isString()
        .withMessage('password must be a string')
        .bail()
        .isLength({min: 6, max: 20})
        .withMessage('password length should be between 6 and 20 characters'),
];
