/**
 * Global Error Handler Middleware
 * Centralized error handling with proper logging and user-friendly messages
 */

const config = require('../config');

/**
 * Custom Error Classes
 */
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}

class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429);
    }
}

/**
 * Error Response Formatter
 */
function formatErrorResponse(err, req) {
    const response = {
        status: err.status || 'error',
        message: err.message || 'An error occurred',
    };

    // Add validation errors if present
    if (err.errors && Array.isArray(err.errors)) {
        response.errors = err.errors;
    }

    // Add stack trace in development
    if (config.isDevelopment) {
        response.stack = err.stack;
        response.details = {
            name: err.name,
            statusCode: err.statusCode,
            isOperational: err.isOperational,
        };
    }

    // Add request info in development
    if (config.isDevelopment && config.development.debug) {
        response.request = {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            params: req.params,
            query: req.query,
        };
    }

    return response;
}

/**
 * Log Error
 */
function logError(err, req) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        message: err.message,
        statusCode: err.statusCode,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id,
        stack: err.stack,
    };

    if (err.statusCode >= 500) {
        console.error('❌ Server Error:', errorLog);
    } else if (err.statusCode >= 400) {
        console.warn('⚠️  Client Error:', errorLog);
    } else {
        console.log('ℹ️  Error:', errorLog);
    }

    // TODO: Send to external logging service in production
    // if (config.isProduction) {
    //   sendToLoggingService(errorLog);
    // }
}

/**
 * Handle Prisma Errors
 */
function handlePrismaError(err) {
    // Prisma Client Errors
    if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        return new ConflictError(`${field} already exists`);
    }

    if (err.code === 'P2025') {
        return new NotFoundError('Record');
    }

    if (err.code === 'P2003') {
        return new ValidationError('Foreign key constraint failed');
    }

    if (err.code === 'P2014') {
        return new ValidationError('Invalid relation');
    }

    // Generic Prisma error
    return new AppError('Database operation failed', 500, false);
}

/**
 * Handle JWT Errors
 */
function handleJWTError(err) {
    if (err.name === 'JsonWebTokenError') {
        return new AuthenticationError('Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return new AuthenticationError('Token expired');
    }

    return err;
}

/**
 * Handle Validation Errors
 */
function handleValidationError(err) {
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors || {}).map(e => ({
            field: e.path,
            message: e.message,
        }));
        return new ValidationError('Validation failed', errors);
    }

    return err;
}

/**
 * Handle Multer Errors
 */
function handleMulterError(err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return new ValidationError('File size exceeds limit');
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return new ValidationError('Too many files');
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return new ValidationError('Unexpected file field');
    }

    return err;
}

/**
 * Main Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Handle specific error types
    if (err.code?.startsWith('P')) {
        error = handlePrismaError(err);
    } else if (err.name?.includes('Token')) {
        error = handleJWTError(err);
    } else if (err.name === 'ValidationError') {
        error = handleValidationError(err);
    } else if (err.name === 'MulterError') {
        error = handleMulterError(err);
    }

    // Log error
    logError(error, req);

    // Send response
    res.status(error.statusCode).json(formatErrorResponse(error, req));
}

/**
 * 404 Not Found Handler
 */
function notFoundHandler(req, res, next) {
    const error = new NotFoundError(`Route ${req.originalUrl}`);
    next(error);
}

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Unhandled Rejection Handler
 */
function setupUnhandledRejectionHandler() {
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);

        if (config.isProduction) {
            // Graceful shutdown
            console.log('⚠️  Shutting down gracefully...');
            process.exit(1);
        }
    });
}

/**
 * Uncaught Exception Handler
 */
function setupUncaughtExceptionHandler() {
    process.on('uncaughtException', (err) => {
        console.error('❌ Uncaught Exception:', err);

        if (config.isProduction) {
            // Graceful shutdown
            console.log('⚠️  Shutting down gracefully...');
            process.exit(1);
        }
    });
}

// Setup global handlers
setupUnhandledRejectionHandler();
setupUncaughtExceptionHandler();

module.exports = {
    // Error Classes
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,

    // Middleware
    errorHandler,
    notFoundHandler,
    asyncHandler,
};
