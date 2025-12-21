/**
 * Configuration Module
 * Centralized configuration management with validation
 */

require('dotenv').config();

const config = {
    // Environment
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',

    // Server
    server: {
        port: parseInt(process.env.PORT, 10) || 5000,
        apiVersion: process.env.API_VERSION || 'v1',
        appName: process.env.APP_NAME || 'OPEX Manager',
        appUrl: process.env.APP_URL || 'http://localhost:5173',
    },

    // Database
    database: {
        url: process.env.DATABASE_URL || 'file:./dev.db',
        connectionLimit: 10,
        poolTimeout: 10,
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: process.env.CORS_CREDENTIALS === 'true' || true,
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
        loginMax: parseInt(process.env.RATE_LIMIT_LOGIN_MAX, 10) || 5,
    },

    // File Upload
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
        uploadDir: process.env.UPLOAD_DIR || './uploads',
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || '.xlsx,.xls,.csv').split(','),
    },

    // Email
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true' || false,
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.EMAIL_FROM || 'OPEX Manager <noreply@opexmanager.com>',
    },

    // Redis
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || '',
        db: parseInt(process.env.REDIS_DB, 10) || 0,
        ttl: parseInt(process.env.CACHE_TTL, 10) || 3600,
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/app.log',
        maxSize: process.env.LOG_MAX_SIZE || '10m',
        maxFiles: parseInt(process.env.LOG_MAX_FILES, 10) || 7,
        prettyLogs: process.env.PRETTY_LOGS === 'true' || true,
    },

    // Security
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
        sessionSecret: process.env.SESSION_SECRET || 'your_session_secret',
        cookieSecure: process.env.COOKIE_SECURE === 'true' || false,
        cookieHttpOnly: process.env.COOKIE_HTTP_ONLY === 'true' || true,
        cookieSameSite: process.env.COOKIE_SAME_SITE || 'strict',
    },

    // Feature Flags
    features: {
        enableRegistration: process.env.ENABLE_REGISTRATION === 'true' || false,
        enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true' || false,
        enableTwoFactor: process.env.ENABLE_TWO_FACTOR === 'true' || false,
        enableAuditLog: process.env.ENABLE_AUDIT_LOG === 'true' || true,
        enableActivityLog: process.env.ENABLE_ACTIVITY_LOG === 'true' || true,
    },

    // Backup
    backup: {
        dir: process.env.BACKUP_DIR || './backups',
        retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS, 10) || 30,
        autoBackupEnabled: process.env.AUTO_BACKUP_ENABLED === 'true' || true,
        autoBackupSchedule: process.env.AUTO_BACKUP_SCHEDULE || '0 2 * * *', // 2 AM daily
    },

    // Performance
    performance: {
        compressionEnabled: process.env.COMPRESSION_ENABLED === 'true' || true,
        compressionLevel: parseInt(process.env.COMPRESSION_LEVEL, 10) || 6,
        cacheEnabled: process.env.CACHE_ENABLED !== 'false',
    },

    // Development
    development: {
        debug: process.env.DEBUG === 'true' || false,
    },
};

/**
 * Validate critical configuration
 */
function validateConfig() {
    const errors = [];

    // Check JWT secret in production
    if (config.isProduction && config.jwt.secret.includes('change_this')) {
        errors.push('JWT_SECRET must be changed in production!');
    }

    // Check JWT secret length
    if (config.jwt.secret.length < 32) {
        errors.push('JWT_SECRET must be at least 32 characters long!');
    }

    // Check database URL
    if (!config.database.url) {
        errors.push('DATABASE_URL is required!');
    }

    // Check port
    if (isNaN(config.server.port) || config.server.port < 1 || config.server.port > 65535) {
        errors.push('PORT must be a valid port number (1-65535)!');
    }

    // Check session secret in production
    if (config.isProduction && config.security.sessionSecret.includes('change_this')) {
        errors.push('SESSION_SECRET must be changed in production!');
    }

    if (errors.length > 0) {
        console.error('❌ Configuration Errors:');
        errors.forEach(error => console.error(`  - ${error}`));

        if (config.isProduction) {
            process.exit(1);
        } else {
            console.warn('⚠️  Running with invalid configuration in development mode');
        }
    }
}

// Validate on load
validateConfig();

// Log configuration in development
if (config.isDevelopment && config.development.debug) {
    console.log('📋 Configuration loaded:', {
        env: config.env,
        port: config.server.port,
        database: config.database.url.includes('mysql') ? 'MySQL' : 'SQLite',
        features: config.features,
    });
}

module.exports = config;
