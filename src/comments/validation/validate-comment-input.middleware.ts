import {body} from "express-validator";

export const commentInputValidation = [
    body('content')
        .isString().withMessage('Content should be a string')
        .trim()
        .isLength({min: 20, max: 300}).withMessage('Content length should be from 20 to 300'),
];

