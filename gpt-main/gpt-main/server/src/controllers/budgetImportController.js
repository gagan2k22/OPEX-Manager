const budgetImportService = require('../services/budgetImportService');

const importBudgets = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { dryRun, createMissingMasters, customMapping } = req.body;
        const userId = req.user ? req.user.id : null;

        const result = await budgetImportService.processImport(req.file.buffer, userId, {
            dryRun: dryRun === 'true',
            createMissingMasters: createMissingMasters === 'true',
            customMapping: customMapping ? JSON.parse(customMapping) : {}
        });

        res.json(result);
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { importBudgets };
