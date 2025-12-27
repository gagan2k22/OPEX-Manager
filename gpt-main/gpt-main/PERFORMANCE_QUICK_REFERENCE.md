# Performance Optimization Quick Reference

## Cache Management

### Clear All Cache
```javascript
const cache = require('./utils/cache');
await cache.flush();
```

### Clear Specific Pattern
```javascript
// Clear all tracker cache
await cache.invalidatePattern('tracker:*');

// Clear all user cache
await cache.invalidatePattern('user:*');
```

### Check Cache Stats
```javascript
// In memory cache (if Redis not enabled)
const stats = cache.memoryCache.size;
console.log(`Cache entries: ${stats}`);
```

## Performance Monitoring

### Enable Debug Logging
Set in `.env`:
```
DEBUG=true
LOG_LEVEL=debug
```

### Monitor Cache Hit Rates
Check logs for:
```
Cache HIT for tracker data: tracker:FY25:0:100::default
Cache MISS for tracker data: tracker:FY25:0:100:search:default
```

### Monitor Authentication Performance
```
User logged in successfully (user@example.com)
Database connected successfully
```

## Cache Configuration

### TTL Settings
| Cache Type | TTL | Location |
|------------|-----|----------|
| User Auth | 300s (5 min) | `auth.js:62` |
| Tracker Data | 120s (2 min) | `xlsTracker.controller.js:173` |
| General | Configurable | `cache.set(key, value, ttlSeconds)` |

### Cache Keys
```javascript
// User authentication
`user:${userId}:${sessionId}`

// Tracker data
`tracker:${fy}:${page}:${pageSize}:${search}:${sortModel}`

// Pattern matching
'tracker:*'  // All tracker cache
'user:*'     // All user cache
```

## Troubleshooting

### Cache Not Working
1. Check if cache is enabled in config
2. Verify Redis connection (if using Redis)
3. Check logs for cache errors

### Stale Data Issues
1. Verify cache invalidation is called after updates
2. Check TTL settings
3. Manually clear cache if needed

### Performance Not Improved
1. Check if requests are being cached (look for HIT in logs)
2. Verify query optimization is working
3. Monitor database query times

## API Request Deduplication

### How It Works
- Identical GET requests made simultaneously share the same promise
- Subsequent duplicate requests are cancelled
- First request completes and all callers receive the result

### Monitoring
Check browser console for:
```
Request cancelled: Duplicate request cancelled
```

### Disable (if needed)
Comment out deduplication logic in `client/src/utils/api.js` lines 29-45

## Database Query Optimization

### Check Query Performance
Enable Prisma query logging in `.env`:
```
DEBUG=true
```

Look for:
```
Query: SELECT ... [Duration: 150ms]
```

### Optimize Queries
Use explicit `select` instead of `include`:
```javascript
// ❌ Bad - fetches all fields
include: { roles: true }

// ✅ Good - fetches only needed fields
select: {
    roles: {
        select: {
            role: {
                select: { name: true }
            }
        }
    }
}
```

## Import Performance

### BOA Allocation Import
- Batch size: 50 rows
- Transaction timeout: 15 seconds
- Pre-fetches all services for O(1) lookup

### Monitor Import Progress
Check logs for:
```
BOA Import: Pre-fetched 150 services for matching
Processing batch 1 (rows 1-50)
Processing batch 2 (rows 51-100)
BOA Import Complete: 95 successful, 5 errors
```

## Emergency Performance Reset

If performance degrades:

1. **Clear all cache:**
```bash
# Restart server to clear in-memory cache
npm run dev
```

2. **Check database:**
```bash
npm run db:check
```

3. **Review logs:**
```bash
# Check server/logs directory
tail -f server/logs/combined.log
```

4. **Disable caching temporarily:**
Edit `server/src/config/index.js`:
```javascript
cache: {
    enabled: false  // Temporarily disable
}
```

## Performance Benchmarks

### Expected Response Times
| Endpoint | Cold (no cache) | Warm (cached) |
|----------|----------------|---------------|
| `/api/auth/login` | 100-150ms | N/A |
| `/api/budgets/tracker` | 250-400ms | 5-10ms |
| `/api/reports/dashboard` | 300-500ms | 5-10ms |
| `/api/master/*` | 50-100ms | 2-5ms |

### Import Benchmarks
| Rows | Expected Time |
|------|---------------|
| 50 | 5-8 seconds |
| 100 | 10-15 seconds |
| 500 | 45-60 seconds |
| 1000 | 90-120 seconds |

## Best Practices

### 1. Cache Invalidation
Always invalidate cache after data modifications:
```javascript
// After update
await cache.invalidatePattern('tracker:*');
```

### 2. Error Handling
Cache failures should not break functionality:
```javascript
try {
    const cached = await cache.get(key);
    if (cached) return cached;
} catch (error) {
    logger.error('Cache error:', error);
    // Continue without cache
}
```

### 3. Monitoring
- Enable debug logging in development
- Monitor cache hit rates in production
- Track response times

### 4. Scaling
- Consider Redis for multi-instance deployments
- Implement cache warming for frequently accessed data
- Monitor memory usage

## Configuration Files

### Server Config
`server/src/config/index.js`
```javascript
cache: {
    enabled: process.env.CACHE_ENABLED === 'true'
}
```

### Environment Variables
`.env`
```
CACHE_ENABLED=true
DEBUG=false
LOG_LEVEL=info
```

## Support & Debugging

### Enable Verbose Logging
```bash
DEBUG=true LOG_LEVEL=debug npm run dev
```

### Check Cache Status
```javascript
// In server code
const cache = require('./utils/cache');
console.log('Cache enabled:', cache.enabled);
console.log('Redis connected:', cache.isConnected);
```

### Performance Profiling
Use Node.js profiler:
```bash
node --prof src/app.js
```

---

**Last Updated:** 2025-12-27  
**Version:** 1.0.0
