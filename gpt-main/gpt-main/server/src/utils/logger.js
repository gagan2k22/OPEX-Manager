/**
 * Logger Utility
 * Production-ready logging using Winston
 */

const winston = require('winston');
const path = require('path');
const config = require('../config');

// Define custom log levels if needed, or use default npm/syslog levels
// winston.config.npm.levels: 
// { error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6 }

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
        ({ level, message, timestamp, stack }) => {
            return `${timestamp} ${level}: ${message} ${stack ? '\n' + stack : ''}`;
        }
    )
);

// Create the logger instance
const logger = winston.createLogger({
    level: config.logging.level || 'info', // Default to info
    format: logFormat,
    defaultMeta: { service: 'opex-api' },
    transports: [
        // 1. Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // 2. Write all logs with importance level of `info` or less to `app.log`
        new winston.transports.File({
            filename: path.join('logs', 'app.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
    exitOnError: false, // Do not exit on handled exceptions
});

// If we're not in production then log to the `console`
if (config.env !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
        level: config.development.debug ? 'debug' : 'info',
    }));
}

// Create a stream object for Morgan middleware (HTTP request logging)
logger.stream = {
    write: (message) => {
        // Morgan adds a newline, strip it
        logger.http(message.trim());
    },
};

module.exports = logger;
