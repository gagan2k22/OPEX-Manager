/**
 * Prisma Client Singleton
 * Manages database connection with proper lifecycle handling
 */

const { PrismaClient } = require('@prisma/client');
const config = require('./config');
const logger = require('./utils/logger');

// Create a singleton instance with optimized settings
const prismaClientSingleton = () => {
    const prisma = new PrismaClient({
        log: config.development.debug
            ? [
                { emit: 'event', level: 'query' },
                { emit: 'stdout', level: 'error' },
                { emit: 'stdout', level: 'info' },
                { emit: 'stdout', level: 'warn' },
            ]
            : ['error'],
        errorFormat: config.isProduction ? 'minimal' : 'colorless',
        datasources: {
            db: {
                url: config.database.url,
            }
        }
    });

    // Middleware for query logging (simulated via extension or event)
    if (config.development.debug) {
        prisma.$on('query', (e) => {
            logger.debug(`Query: ${e.query} [Duration: ${e.duration}ms]`);
        });
    }

    // Soft delete middleware (if needed) example
    /*
    prisma.$use(async (params, next) => {
      if (params.model == 'User' && params.action == 'delete') {
        params.action = 'update';
        params.args['data'] = { deleted: true };
      }
      return next(params);
    });
    */

    return prisma;
};

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (!config.isProduction) {
    globalForPrisma.prisma = prisma;
}

// Connection test
prisma.$connect()
    .then(() => {
        if (config.development.debug) logger.info('Database connected successfully');
    })
    .catch((err) => {
        logger.error('Database connection failed:', err);
        // Don't exit here, let health check report it
    });

module.exports = prisma;
