const prisma = require('../prisma');
const logger = require('../utils/logger');

/**
 * Audit Service
 * Centralized logging for entity changes and system activities
 */

const logAction = async (userId, action, entityType, entityId, oldValue = null, newValue = null, comment = null) => {
    try {
        return await prisma.auditLog.create({
            data: {
                userId,
                action,
                entityType,
                entityId: parseInt(entityId),
                oldValue: oldValue ? JSON.stringify(oldValue) : null,
                newValue: newValue ? JSON.stringify(newValue) : null,
                comment
            }
        });
    } catch (error) {
        // We log the audit failure but don't crash the main process
        logger.error('Audit Failure: %s', error.stack);
    }
};

const logActivity = async (userId, username, action, details = null, ip = null) => {
    try {
        return await prisma.userActivityLog.create({
            data: {
                user_id: userId,
                username,
                action,
                details,
                ip_address: ip
            }
        });
    } catch (error) {
        logger.error('Activity Log Failure: %s', error.stack);
    }
};

module.exports = {
    logAction,
    logActivity
};
