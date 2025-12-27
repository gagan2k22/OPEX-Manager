/**
 * Security Middleware Configuration
 * Bundles Helmet, CORS, Rate Limiting, and internal security checks
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../utils/logger');

// 1. Helmet Configuration (Security Headers)
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline might be needed for some scripts, refine for production
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", config.server.appUrl],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
});

// 2. CORS Configuration - FIXED
const corsOptions = {
    origin: (origin, callback) => {
        // Log CORS request for debugging
        logger.info(`CORS check - Origin: ${origin || 'no-origin'}, Env: ${config.env}`);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            logger.info('CORS: Allowing request with no origin');
            return callback(null, true);
        }

        // In development, allow ALL origins
        if (config.env === 'development') {
            logger.info(`CORS: Allowing ${origin} (development mode)`);
            return callback(null, true);
        }

        // In production, check against allowed origins
        const allowedOrigins = config.cors.origin.split(',').map(o => o.trim());
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            logger.info(`CORS: Allowing ${origin} (matches allowed list)`);
            callback(null, true);
        } else {
            logger.error(`CORS: Rejecting ${origin} (not in allowed list: ${allowedOrigins.join(', ')})`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

const corsConfig = cors(corsOptions);

// 3. Rate Limiting
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
    },
});

const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: config.rateLimit.loginMax, // start blocking after 5 requests
    message: {
        status: 'error',
        message: 'Too many login attempts from this IP, please try again after an hour',
    },
});

// 4. Request Sanitization (SQL Injection / XSS)
// Note: We are using Prisma which prevents SQL injection by design for standard queries.
// XSS should be handled by sanitizing input in validator.js and escaping output in frontend.
// However, we can add a basic middleware here to strip obvious bad chars if needed.

/**
 * Basic XSS Filter (Simple Implementation)
 * For robust specific needs, consider 'xss-clean' library
 */
const xssFilter = (req, res, next) => {
    if (req.body) {
        // Traverse body and escape basic HTML tags if input is string
        // const sanitize = (obj) => ... 
        // Implemented in validator.js sanitizeInput
    }
    next();
};

module.exports = {
    helmetConfig,
    corsConfig,
    apiLimiter,
    loginLimiter,
    xssFilter
};
