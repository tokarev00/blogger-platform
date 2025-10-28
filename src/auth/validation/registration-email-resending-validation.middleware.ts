import {body} from "express-validator";

export const registrationEmailResendingValidation = [
    body("email")
        .isString().withMessage("email must be a string")
        .trim()
        .notEmpty().withMessage("email is required")
        .bail()
        .isEmail().withMessage("email must be valid"),
];
