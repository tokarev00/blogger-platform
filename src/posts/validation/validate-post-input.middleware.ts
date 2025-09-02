import { body } from 'express-validator';

export const postInputValidation = [
    body('title')
        .exists({ checkFalsy: true }).withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 30 }).withMessage('Title must not exceed 30 characters'),

    body('shortDescription')
        .exists({ checkFalsy: true }).withMessage('Short description is required')
        .isString().withMessage('Short description must be a string')
        .isLength({ max: 100 }).withMessage('Short description must not exceed 100 characters'),

    body('content')
        .exists({ checkFalsy: true }).withMessage('Content is required')
        .isString().withMessage('Content must be a string')
        .isLength({ max: 1000 }).withMessage('Content must not exceed 1000 characters'),

    body('blogId')
        .exists({ checkFalsy: true }).withMessage('Blog ID is required')
        .isString().withMessage('Blog ID must be a string')
        .matches(/^[a-fA-F0-9]{24}$/).withMessage('Blog ID must be a valid 24-character hex string'),
];
