const express = require('express');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission.middleware');
const poController = require('../controllers/po.controller');

const router = express.Router();

const { validate, validateId } = require('../middleware/validator');

router.use(authenticate);

// List POs
router.get('/', checkPermission('VIEW_DASHBOARDS'), poController.listPOs);

// Get PO details
router.get('/:id', checkPermission('VIEW_DASHBOARDS'), validateId(), poController.getPO);

// Create PO
router.post('/', checkPermission('CREATE_LINE_ITEMS'), validate('createPO'), poController.createPO); // Using CREATE_LINE_ITEMS as proxy for PO creation

// Update PO
router.put('/:id', checkPermission('EDIT_LINE_ITEMS'), validateId(), validate('updatePO'), poController.updatePO);

// Delete PO (Admin only)
router.delete('/:id', checkPermission('Admin'), validateId(), poController.deletePO);

module.exports = router;
