const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { checkPermission } = require('../middleware/permission.middleware');
const { getActuals, createActuals } = require('../controllers/actuals.controller');

const router = express.Router();

router.use(authenticate);

// View actuals - All authenticated users
router.get('/', checkPermission('VIEW_DASHBOARDS'), getActuals);

// Upload actuals - Editor, Approver, Admin
router.post('/', checkPermission('UPLOAD_ACTUALS'), validate('createActual'), createActuals);

module.exports = router;
