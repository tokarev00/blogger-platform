import { body } from 'express-validator';

export const blogInputValidation = [
    body('name')
        .exists({ checkFalsy: true }).withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ max: 15 }).withMessage('Name must not exceed 15 characters'),

    body('description')
        .exists({ checkFalsy: true }).withMessage('Description is required')
        .isString().withMessage('Description must be a string')
        .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),

    body('websiteUrl')
        .exists({ checkFalsy: true }).withMessage('Website URL is required')
        .isString().withMessage('Website URL must be a string')
        .isLength({ max: 100 }).withMessage('Website URL must not exceed 100 characters')
        .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
        .withMessage('Website URL must be a valid HTTPS URL'),
];
