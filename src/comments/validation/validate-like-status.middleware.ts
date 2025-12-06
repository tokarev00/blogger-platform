import {body} from "express-validator";

const allowedStatuses = ['Like', 'Dislike', 'None'];

export const likeStatusValidation = [
    body('likeStatus')
        .isString().withMessage('likeStatus should be a string')
        .isIn(allowedStatuses).withMessage('likeStatus should be one of: Like, Dislike, None'),
];

