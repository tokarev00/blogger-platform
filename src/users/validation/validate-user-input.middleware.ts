import {body} from "express-validator";

export const userInputValidation = [
    body('login')
        .exists()
        .withMessage('Login is required')
        .bail()
        .isString()
        .withMessage('Login must be a string')
        .bail()
        .trim()
        .isLength({min: 3, max: 10})
        .withMessage('Login length should be between 3 and 10 characters')
        .bail()
        .matches(/^[a-zA-Z0-9_-]*$/)
        .withMessage('Login contains invalid characters'),
    body('password')
        .exists()
        .withMessage('Password is required')
        .bail()
        .isString()
        .withMessage('Password must be a string')
        .bail()
        .isLength({min: 6, max: 20})
        .withMessage('Password length should be between 6 and 20 characters'),
    body('email')
        .exists()
        .withMessage('Email is required')
        .bail()
        .isString()
        .withMessage('Email must be a string')
        .bail()
        .trim()
        .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
        .withMessage('Email must be valid'),
];
