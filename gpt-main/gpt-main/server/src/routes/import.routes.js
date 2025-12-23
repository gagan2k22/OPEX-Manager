const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../controllers/import.controller');
const { authenticate } = require('../middleware/auth');

// Multer in-memory storage for processing the buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.use(authenticate);

// Main Excel Import Route
router.post('/xls', upload.single('file'), importController.importExcel);

module.exports = router;
