const express = require('express');
const router = express.Router();
const xlsTrackerController = require('../controllers/xlsTracker.controller');
const { authenticate, restrictTo } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

router.use(authenticate);

// Main Tracker View (Combined Service + FY Data)
router.get('/tracker', xlsTrackerController.getTrackerData);
router.put('/tracker/:id', xlsTrackerController.updateTrackerRow);
router.get('/net-tracker', xlsTrackerController.getNetBudgetTracker);
// BOA Allocation
router.get('/boa-allocation', xlsTrackerController.getBOAAllocationData);
router.post('/import-boa', restrictTo('Admin'), upload.single('file'), xlsTrackerController.importBOAAllocation);

// Remarks
router.get('/tracker/:id/remarks', xlsTrackerController.getRemarkLogs);
router.delete('/tracker/remarks/:logId', restrictTo('Admin'), xlsTrackerController.deleteRemarkLog);

// Monthly Entity Splits
router.get('/splits/:serviceId', xlsTrackerController.getEntitySplits);
router.post('/splits/update', restrictTo('Admin', 'Editor'), xlsTrackerController.updateMonthlyActual);

module.exports = router;
