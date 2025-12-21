const prisma = require('../prisma');

class ImportHistoryService {
    async getImportHistory(userId, isAdmin) {
        const where = isAdmin ? {} : { userId };

        return await prisma.importJob.findMany({
            where,
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
}

module.exports = new ImportHistoryService();
