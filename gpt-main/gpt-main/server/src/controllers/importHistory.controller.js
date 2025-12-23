const importHistoryService = require('../services/importHistory.service');
const logger = require('../utils/logger');

const getHistory = async (req, res) => {
    try {
        const isAdmin = req.user.roles.includes('Admin');
        const history = await importHistoryService.getImportHistory(req.user.id, isAdmin);
        res.json(history);
    } catch (error) {
        logger.error('Get History Controller Error: %s', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getHistory
};
