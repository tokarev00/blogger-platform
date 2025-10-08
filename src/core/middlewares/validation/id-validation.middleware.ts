import {param, ValidationChain} from 'express-validator';

export function createObjectIdParamValidation(paramName: string): ValidationChain {
    return param(paramName)
        .exists()
        .withMessage('ID is required')
        .bail()
        .isString()
        .withMessage('ID must be a string')
        .bail()
        .matches(/^[a-fA-F0-9]{24}$/)
        .withMessage('ID must be a 24-character hexadecimal string');
}

export const idValidation = createObjectIdParamValidation('id');
