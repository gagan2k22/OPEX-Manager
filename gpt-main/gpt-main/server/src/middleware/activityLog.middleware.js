const prisma = require('../prisma');

const activityLogger = (req, res, next) => {
    res.on('finish', async () => {
// Only log API requests
        if (req.url.startsWith('/api')) {
            try {
                const userId = req.user?.id || null;
                const username = req.user?.name || req.user?.email || 'Anonymous';

                // Don't log login attempts with passwords in details
                let details = '';
                if (req.body) {
                    const bodyCopy = { ...req.body };
                    if (bodyCopy.password) bodyCopy.password = '***';
                    details = JSON.stringify(bodyCopy);
                }

                await prisma.userActivityLog.create({
                    data: {
                        user_id: userId,
                        username: username,
                        action: `${req.method} ${req.originalUrl || req.url}`,
                        details: details.substring(0, 1000), // Truncate if too long
                        ip_address: req.ip || req.connection.remoteAddress,
                        timestamp: new Date()
                    }
                });
            } catch (error) {
                // We use console.error here to avoid circular dependencies with logger
                console.error('Error logging activity:', error.message);
            }
        }
    });

    next();
};

module.exports = activityLogger;

