const prisma = require('../prisma');
const logger = require('../utils/logger');

const getImportHistory = async (userId, isAdmin) => {
    try {
        const where = isAdmin ? {} : { userId };

        return await prisma.importHistory.findMany({
            where,
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
    } catch (error) {
        logger.error('Get Import History Service Error: %s', error.stack);
        throw error;
    }
};

module.exports = {
    getImportHistory
};
