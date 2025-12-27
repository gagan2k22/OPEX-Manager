const Redis = require('ioredis');
const logger = require('./logger');
const config = require('../config');

/**
 * Unified Caching Service
 * Uses Redis if enabled and available, fallbacks to optimized In-Memory cache.
 */
class CacheService {
    constructor() {
        this.enabled = config.cache?.enabled || false;
        this.memoryCache = new Map();
        this.redis = null;
        this.isConnected = false;

        if (this.enabled) {
            try {
                this.redis = new Redis({
                    host: process.env.REDIS_HOST || 'localhost',
                    port: process.env.REDIS_PORT || 6379,
                    retryStrategy: (times) => {
                        // Stop retrying after 3 attempts
                        if (times > 3) {
                            logger.warn('Redis connection failed after 3 attempts, using in-memory cache');
                            return null;
                        }
                        const delay = Math.min(times * 100, 3000);
                        return delay;
                    },
                    maxRetriesPerRequest: 2,
                    lazyConnect: true, // Don't connect immediately
                    enableOfflineQueue: false
                });

                this.redis.on('error', (err) => {
                    logger.warn('Redis unavailable, using in-memory cache: %s', err.message);
                    this.isConnected = false;
                });

                this.redis.on('connect', () => {
                    logger.info('Connected to Redis for caching');
                    this.isConnected = true;
                });

                // Try to connect but don't fail if it doesn't work
                this.redis.connect().catch(err => {
                    logger.warn('Could not connect to Redis, using in-memory cache: %s', err.message);
                    this.isConnected = false;
                });
            } catch (err) {
                logger.warn('Failed to initialize Redis, using in-memory cache: %s', err.message);
                this.redis = null;
                this.isConnected = false;
            }
        } else {
            logger.info('Cache is disabled or using in-memory cache only');
        }
    }

    /**
     * Get value from cache
     */
    async get(key) {
        try {
            if (this.enabled && this.isConnected && this.redis) {
                const data = await this.redis.get(key);
                return data ? JSON.parse(data) : null;
            }

            // Memory Fallback
            if (this.memoryCache.has(key)) {
                const { value, expires } = this.memoryCache.get(key);
                if (Date.now() > expires) {
                    this.memoryCache.delete(key);
                    return null;
                }
                return value;
            }
            return null;
        } catch (error) {
            logger.error('Cache Get Error: %s', error.message);
            return null;
        }
    }

    /**
     * Set value in cache
     */
    async set(key, value, ttlSeconds = 3600) {
        try {
            if (this.enabled && this.isConnected && this.redis) {
                await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
                return true;
            }

            // Memory Fallback
            this.memoryCache.set(key, {
                value,
                expires: Date.now() + (ttlSeconds * 1000)
            });

            // TTL Cleanup prevention
            if (this.memoryCache.size > 2000) {
                const firstKey = this.memoryCache.keys().next().value;
                this.memoryCache.delete(firstKey);
            }
            return true;
        } catch (error) {
            logger.error('Cache Set Error: %s', error.message);
            return false;
        }
    }

    /**
     * Delete from cache
     */
    async del(key) {
        try {
            if (this.enabled && this.isConnected && this.redis) {
                await this.redis.del(key);
            }
            this.memoryCache.delete(key);
            return true;
        } catch (error) {
            logger.error('Cache Del Error: %s', error.message);
            return false;
        }
    }

    /**
     * Invalidate by pattern (e.g. "reports:*")
     */
    async invalidatePattern(pattern) {
        try {
            if (this.enabled && this.isConnected && this.redis) {
                const keys = await this.redis.keys(pattern);
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                }
            }

            // For memory cache, we have to iterate
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
            for (const key of this.memoryCache.keys()) {
                if (regex.test(key)) {
                    this.memoryCache.delete(key);
                }
            }
            return true;
        } catch (error) {
            logger.error('Cache Invalidate Error: %s', error.message);
            return false;
        }
    }

    /**
     * Clear all
     */
    async flush() {
        if (this.enabled && this.isConnected && this.redis) {
            await this.redis.flushdb();
        }
        this.memoryCache.clear();
    }
}

module.exports = new CacheService();
