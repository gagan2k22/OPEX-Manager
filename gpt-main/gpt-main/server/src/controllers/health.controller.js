/**
 * Health Check Controller
 * Check application uptime and database connectivity
 */

const prisma = require('../prisma');
const os = require('os');

/**
 * Get system health status
 * @route GET /api/health
 */
const getHealth = async (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        responsetime: process.hrtime(),
        message: 'OK',
        timestamp: Date.now(),
        system: {
            loadavg: os.loadavg(),
            freemem: os.freemem(),
            totalmem: os.totalmem(),
        }
    };

    try {
        // Check Database Connectivity
        await prisma.$queryRaw`SELECT 1`;
        healthcheck.database = 'connected';

        res.status(200).json(healthcheck);
    } catch (err) {
        healthcheck.message = err.message;
        healthcheck.database = 'disconnected';
        res.status(503).json(healthcheck);
    }
};

module.exports = {
    getHealth,
};
