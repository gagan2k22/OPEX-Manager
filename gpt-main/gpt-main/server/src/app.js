/**
 * Application Entry Point
 * Production-ready Express application structure
 */

const express = require('express');
require('express-async-errors'); // Must be imported before routes
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Import configuration and utilities
const config = require('./config');
const logger = require('./utils/logger');
const { initCronJobs } = require('./utils/cronJobs');

// Import middleware
const { helmetConfig, corsConfig, apiLimiter, xssFilter } = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/validator');
const activityLogger = require('./middleware/activityLog.middleware');

// Import routes
// Note: We'll import these dynamically or explicitly as needed

// Initialize Express app
const app = express();

// ==========================================
// 1. Security & Basic Middleware (Run first)
// ==========================================

// Security Headers (Helmet)
app.use(helmetConfig);

// Cross-Origin Resource Sharing (CORS)
app.use(corsConfig);

// Rate Limiting (Global API limit)
app.use('/api', apiLimiter);

// Input Sanitization (XSS & Basic)
app.use(xssFilter);
app.use(sanitizeInput);

// Compression (Gzip)
if (config.performance.compressionEnabled) {
    app.use(compression({
        level: config.performance.compressionLevel,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) return false;
            return compression.filter(req, res);
        }
    }));
}

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// Body Parsing
app.use(express.json({ limit: process.env.MAX_FILE_SIZE ? '10mb' : '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Activity Logger
app.use(activityLogger);

// Request Timeout
app.use((req, res, next) => {
    req.setTimeout(15000); // 15 seconds
    res.setTimeout(15000);
    next();
});

// ==========================================
// 2. Application Routes
// ==========================================

// Health Check
app.use('/health', require('./routes/health.routes')); // Mount at /health

// API Routes
try {
    // Auth & User
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/users', require('./routes/user.routes'));

    // Core Modules
    app.use('/api/master', require('./routes/masterData.routes'));
    app.use('/api/budgets', require('./routes/budget.routes'));
    app.use('/api/pos', require('./routes/po.routes'));
    app.use('/api/actuals', require('./routes/actuals.routes'));
    app.use('/api/actuals', require('./routes/actualsImport.routes'));

    // Helper Modules
    app.use('/api/line-items', require('./routes/lineItem.routes'));
    app.use('/api/fiscal-years', require('./routes/fiscalYear.routes'));
    app.use('/api/currency-rates', require('./routes/currencyRate.routes'));

    // Reports & Analytics
    app.use('/api/reports', require('./routes/reports.routes'));
    app.use('/api/imports', require('./routes/importHistory.routes'));
    app.use('/api/actual-boa', require('./routes/actualBOA.routes'));
    app.use('/api/budget-boa', require('./routes/budgetBOA.routes'));
    app.use('/api/budget-detail', require('./routes/budgetDetail.routes'));

} catch (error) {
    logger.error('Failed to load routes: %s', error.message);
    process.exit(1);
}

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
    logger.info(`Serving static files from: ${clientDistPath}`);
    app.use(express.static(clientDistPath));

    // API Status info moved from root
    app.get('/api/status', (req, res) => {
        res.json({
            message: config.server.appName + ' API',
            version: '2.0.0',
            status: 'running',
            env: config.env,
        });
    });

    app.get('*', (req, res, next) => {
        // Only serve index.html if it's not an API or uploads route
        if (req.url.startsWith('/api') || req.url.startsWith('/health') || req.url.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
} else {
    // Root Route for development
    app.get('/', (req, res) => {
        res.json({
            message: config.server.appName + ' API (Dev)',
            version: '2.0.0',
            status: 'running',
            env: config.env,
        });
    });
}

// ==========================================
// 3. Error Handling (Run last)
// ==========================================

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// ==========================================
// 4. Server Initialization
// ==========================================

// Only start server if this file is run directly
if (require.main === module) {
    const PORT = config.server.port;

    const server = app.listen(PORT, () => {
        logger.info(`Server running in ${config.env} mode on port ${PORT}`);

        // Initialize Cron Jobs
        try {
            initCronJobs();
            logger.info('Cron jobs initialized');
        } catch (err) {
            logger.error('Failed to init cron jobs:', err);
        }
    });

    // Handle server errors
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            logger.error(`Port ${PORT} is already in use`);
        } else {
            logger.error('Server error:', error);
        }
        process.exit(1);
    });

    // Graceful Shutdown
    const gracefulShutdown = async (signal) => {
        logger.info(`${signal} received. Starting graceful shutdown...`);

        server.close(() => {
            logger.info('HTTP server closed');
        });

        try {
            const prisma = require('./prisma');
            await prisma.$disconnect();
            logger.info('Database connection closed');
        } catch (err) {
            logger.error('Error closing DB:', err);
        }

        process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
