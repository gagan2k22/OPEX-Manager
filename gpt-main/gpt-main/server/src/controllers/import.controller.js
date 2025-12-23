const migrationService = require('../services/migration.service');
const logger = require('../utils/logger');

const importExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const auditService = require('../services/audit.service');
        logger.info(`Starting migration for file: ${req.file.originalname} (User: ${req.user.email})`);

        const result = await migrationService.migrateExcel(req.file.buffer, req.user.id, req.file.originalname);

        // Audit the import
        await auditService.logAction(
            req.user.id,
            'IMPORT_EXCEL',
            'ServiceMaster',
            0,
            { filename: req.file.originalname },
            { stats: result }
        );

        res.json({
            message: 'Migration completed successfully',
            details: result
        });
    } catch (error) {
        logger.error('Import Excel Error: %s', error.stack);
        res.status(500).json({
            message: 'Error during migration process',
            error: error.message
        });
    }
};

module.exports = {
    importExcel
};
