const Joi = require('joi');
const AppError = require('../errors/app.error');
const { capitalizeFirstLetter } = require("../utils/string.utils");

class UserValidationService {
    constructor() {
        // I will sanitize the strings in title and tags and content later
        this.nameSchema = Joi.string()
            .required()
            .regex(/^(?!\d)[a-zA-Z0-9_]{3,15}$/)
            .messages({
                'string.base': `Name must be a string`,
                'string.empty': `Name is required`,
                'any.required': `Name is required`,
                'string.pattern.base': `Name must contain only letters, digits, and underscores, be between 3 and 15 characters, and cannot start with a digit`,
            });

        this.emailSchema = Joi.string()
            .required()
            .email()
            .messages({
                'string.base': `Email must be a string`,
                'string.empty': `Email is required`,
                'string.email': `Invalid email format`,
                'any.required': `Email is required`,
            });

        this.passwordSchema = Joi.string()
            .required()
            .regex(/^(?=.{8,20}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/)
            .messages({
                'string.base': `Password must be a string`,
                'string.empty': `Password is required`,
                'any.required': `Password is required`,
                'string.pattern.base': `Password must be between 8 and 20 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character`,
            });
    }

    validateName(fieldName, value) {
        const { error } = this.nameSchema.validate(value);
        if (error) {
            throw new AppError(`${capitalizeFirstLetter(fieldName)}: ${error.details[0].message}`, 400);
        }
        return true;
    }

    validateEmail(fieldName, value) {
        const { error } = this.emailSchema.validate(value);
        if (error) {
            throw new AppError(`${capitalizeFirstLetter(fieldName)}: ${error.details[0].message}`, 400);
        }
        return true;
    }

    validatePassword(fieldName, value) {
        const { error } = this.passwordSchema.validate(value);
        if (error) {
            throw new AppError(`${capitalizeFirstLetter(fieldName)}: ${error.details[0].message}`, 400);
        }
        return true;
    }
}

module.exports = UserValidationService;
