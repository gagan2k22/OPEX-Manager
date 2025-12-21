const express = require('express');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission.middleware');
const importHistoryController = require('../controllers/importHistory.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', checkPermission('VIEW_DASHBOARDS'), importHistoryController.getHistory);

module.exports = router;
