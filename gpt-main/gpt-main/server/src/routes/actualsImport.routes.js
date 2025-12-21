const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission.middleware');
const actualsImportController = require('../controllers/actualsImport.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

// Import Actuals
router.post('/import',
    checkPermission('UPLOAD_ACTUALS'),
    upload.single('file'),
    actualsImportController.importActuals
);

module.exports = router;
