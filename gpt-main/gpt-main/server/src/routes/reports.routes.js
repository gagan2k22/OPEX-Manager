const express = require('express');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission.middleware');
const reportsController = require('../controllers/reports.controller');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', checkPermission('VIEW_DASHBOARDS'), reportsController.getDashboardStats);

module.exports = router;
