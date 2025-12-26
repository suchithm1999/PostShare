/**
 * Standard HTTP status codes
 */
export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};

/**
 * Standard error codes
 */
export const ErrorCode = {
    // Authentication errors
    MISSING_TOKEN: 'MISSING_TOKEN',
    INVALID_TOKEN: 'INVALID_TOKEN',
    EXPIRED_TOKEN: 'EXPIRED_TOKEN',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    UNAUTHORIZED: 'UNAUTHORIZED',

    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    INVALID_FORMAT: 'INVALID_FORMAT',

    // Resource errors
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
    DUPLICATE_USERNAME: 'DUPLICATE_USERNAME',

    // Permission errors
    FORBIDDEN: 'FORBIDDEN',
    NOT_OWNER: 'NOT_OWNER',

    // Rate limiting
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

    // File upload errors
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    UPLOAD_FAILED: 'UPLOAD_FAILED',

    // Database errors
    DATABASE_ERROR: 'DATABASE_ERROR',
    CONNECTION_ERROR: 'CONNECTION_ERROR',

    // Generic errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
};

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(message, statusCode = 500, code = null, details = null) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code || ErrorCode.INTERNAL_ERROR;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            error: this.message,
            code: this.code,
            ...(this.details && { details: this.details }),
            timestamp: this.timestamp,
        };
    }
}

/**
 * Predefined error factories
 */
export const Errors = {
    /**
     * 400 Bad Request
     */
    badRequest(message = 'Bad request', details = null) {
        return new ApiError(message, HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST, details);
    },

    /**
     *401 Unauthorized
     */
    unauthorized(message = 'Authentication required', code = ErrorCode.UNAUTHORIZED) {
        return new ApiError(message, HttpStatus.UNAUTHORIZED, code);
    },

    /**
     * 403 Forbidden
     */
    forbidden(message = 'Access forbidden', code = ErrorCode.FORBIDDEN) {
        return new ApiError(message, HttpStatus.FORBIDDEN, code);
    },

    /**
     * 404 Not Found
     */
    notFound(message = 'Resource not found', resourceType = null) {
        return new ApiError(
            message,
            HttpStatus.NOT_FOUND,
            ErrorCode.NOT_FOUND,
            resourceType ? { resourceType } : null
        );
    },

    /**
     * 409 Conflict
     */
    conflict(message = 'Resource already exists', code = ErrorCode.ALREADY_EXISTS) {
        return new ApiError(message, HttpStatus.CONFLICT, code);
    },

    /**
     * 422 Validation Error
     */
    validation(message = 'Validation failed', errors = {}) {
        return new ApiError(
            message,
            HttpStatus.UNPROCESSABLE_ENTITY,
            ErrorCode.VALIDATION_ERROR,
            errors
        );
    },

    /**
     * 429 Rate Limit
     */
    rateLimit(message = 'Too many requests', retryAfter = null) {
        return new ApiError(
            message,
            HttpStatus.TOO_MANY_REQUESTS,
            ErrorCode.RATE_LIMIT_EXCEEDED,
            retryAfter ? { retryAfter } : null
        );
    },

    /**
     * 500 Internal Server Error
     */
    internal(message = 'Internal server error') {
        return new ApiError(message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    },

    /**
     * Database error
     */
    database(message = 'Database operation failed') {
        return new ApiError(message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.DATABASE_ERROR);
    },
};

/**
 * Error response helper
 * Sends structured JSON error response
 * 
 * @param {Object} res - Express/Vercel response object
 * @param {Error|ApiError} error - Error object
 */
export function sendError(res, error) {
    // Log error for debugging
    console.error('API Error:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
    });

    // If it's our custom ApiError, use its properties
    if (error instanceof ApiError) {
        return res.status(error.statusCode).json(error.toJSON());
    }

    // For unknown errors, send generic internal server error
    return res.status(500).json({
        error: 'An unexpected error occurred',
        code: ErrorCode.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Success response helper
 * Sends structured JSON success response
 * 
 * @param {Object} res - Express/Vercel response object
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export function sendSuccess(res, data, statusCode = 200) {
    return res.status(statusCode).json(data);
}

/**
 * Async error wrapper for API routes
 * Catches async errors and sends proper error responses
 * 
 * @param {Function} handler - Async route handler
 * @returns {Function} Wrapped handler
 */
export function asyncHandler(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (error) {
            sendError(res, error);
        }
    };
}

/**
 * Validation error helper
 * Creates a validation error from joi/zod validation results
 * 
 * @param {Object} validationResult - Validation result object
 * @returns {ApiError} Validation error
 */
export function createValidationError(validationResult) {
    const errors = {};

    // Handle Joi validation errors
    if (validationResult.details) {
        validationResult.details.forEach((detail) => {
            const key = detail.path.join('.');
            errors[key] = detail.message;
        });
    }

    // Handle object-based errors
    if (typeof validationResult === 'object') {
        Object.assign(errors, validationResult);
    }

    return Errors.validation('Validation failed', errors);
}

/**
 * Example usage in API routes:
 * 
 * import { sendError, Errors, asyncHandler } from '@/lib/errors';
 * 
 * export default asyncHandler(async (req, res) => {
 *   const { email } = req.body;
 *   
 *   if (!email) {
 *     throw Errors.validation('Email is required', { email: 'Email field is missing' });
 *   }
 *   
 *   const user = await findUserByEmail(email);
 *   if (!user) {
 *     throw Errors.notFound('User not found');
 *   }
 *   
 *   sendSuccess(res, { user });
 * });
 */

export default {
    HttpStatus,
    ErrorCode,
    ApiError,
    Errors,
    sendError,
    sendSuccess,
    asyncHandler,
    createValidationError,
};
