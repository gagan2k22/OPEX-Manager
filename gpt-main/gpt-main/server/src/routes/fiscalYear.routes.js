const express = require('express');
const router = express.Router();
const fiscalYearController = require('../controllers/fiscalYear.controller');
const { authenticate, restrictTo } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

// Public route (authenticated) to get fiscal years
router.get('/', authenticate, fiscalYearController.getFiscalYears);

// Admin only routes
router.post('/', authenticate, restrictTo('Admin'), validate('createFiscalYear'), fiscalYearController.createFiscalYear);
router.patch('/:id/status', authenticate, restrictTo('Admin'), fiscalYearController.toggleFiscalYearStatus);

module.exports = router;
