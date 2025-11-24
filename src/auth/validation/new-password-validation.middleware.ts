import {body} from "express-validator";

export const newPasswordValidation = [
    body('newPassword')
        .exists()
        .withMessage('newPassword is required')
        .bail()
        .isString()
        .withMessage('newPassword must be a string')
        .bail()
        .isLength({min: 6, max: 20})
        .withMessage('newPassword length should be between 6 and 20 characters'),
    body('recoveryCode')
        .exists()
        .withMessage('recoveryCode is required')
        .bail()
        .isString()
        .withMessage('recoveryCode must be a string')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('recoveryCode should not be empty'),
];
