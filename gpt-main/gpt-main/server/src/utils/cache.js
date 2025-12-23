/**
 * Caching Service
 * Optimized In-Memory Cache (Redis removed for performance/size optimization)
 */

const config = require('../config');
const logger = require('./logger');

class CacheService {
    constructor() {
        this.memoryCache = new Map();
        this.useRedis = false; // Forced false as dependency removed
        this.client = null;
        this.isConnected = false;
    }

    /**
     * Get value from cache
     * @param {string} key 
     * @returns {Promise<any>}
     */
    async get(key) {
        try {
            if (this.useRedis && this.isConnected) {
                const value = await this.client.get(key);
                return value ? JSON.parse(value) : null;
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
        } catch (err) {
            logger.error('Cache Get Error:', err);
            return null;
        }
    }

    /**
     * Set value in cache
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttlSeconds 
     */
    async set(key, value, ttlSeconds = 3600) {
        try {
            if (this.useRedis && this.isConnected) {
                await this.client.set(key, JSON.stringify(value), {
                    EX: ttlSeconds
                });
                return;
            }

            // Memory Fallback
            this.memoryCache.set(key, {
                value,
                expires: Date.now() + (ttlSeconds * 1000)
            });

            // Basic cleanup if growing too large (simple LRU-ish prevention)
            if (this.memoryCache.size > 1000) {
                const firstKey = this.memoryCache.keys().next().value;
                this.memoryCache.delete(firstKey);
            }
        } catch (err) {
            logger.error('Cache Set Error:', err);
        }
    }

    /**
     * Delete value from cache
     * @param {string} key 
     */
    async del(key) {
        try {
            if (this.useRedis && this.isConnected) {
                await this.client.del(key);
                return;
            }
            this.memoryCache.delete(key);
        } catch (err) {
            logger.error('Cache Del Error:', err);
        }
    }

    /**
     * Flush all cache
     */
    async flush() {
        try {
            if (this.useRedis && this.isConnected) {
                await this.client.flushDb();
                return;
            }
            this.memoryCache.clear();
        } catch (err) {
            logger.error('Cache Flush Error:', err);
        }
    }
}

const cacheService = new CacheService();

module.exports = cacheService;
