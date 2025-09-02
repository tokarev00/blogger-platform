import { param } from 'express-validator';

export const idValidation = param('id')
    .exists()
    .withMessage('ID is required')
    .bail()
    .isString()
    .withMessage('ID must be a string')
    .bail()
    .matches(/^[a-fA-F0-9]{24}$/)
    .withMessage('ID must be a 24-character hexadecimal string');