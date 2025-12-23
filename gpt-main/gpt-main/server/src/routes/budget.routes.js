const express = require('express');
const router = express.Router();
const xlsTrackerController = require('../controllers/xlsTracker.controller');
const { authenticate, restrictTo } = require('../middleware/auth');

router.use(authenticate);

// Main Tracker View (Combined Service + FY Data)
router.get('/tracker', xlsTrackerController.getTrackerData);
router.put('/tracker/:id', xlsTrackerController.updateTrackerRow);
router.get('/net-tracker', xlsTrackerController.getNetBudgetTracker);

// Monthly Entity Splits
router.get('/splits/:serviceId', xlsTrackerController.getEntitySplits);
router.post('/splits/update', restrictTo('Admin', 'Editor'), xlsTrackerController.updateMonthlyActual);

module.exports = router;
