const express = require('express');
const { authenticate } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission.middleware');
const { getLineItems, createLineItem, updateLineItem, deleteLineItem } = require('../controllers/lineItem.controller');
const { updateLineItemMonths } = require('../controllers/lineItemMonth.controller');

const router = express.Router();

router.use(authenticate);

// View line items - All authenticated users
router.get('/', checkPermission('VIEW_DASHBOARDS'), getLineItems);

// Update monthly budgets
router.put('/:id/months', checkPermission('EDIT_LINE_ITEMS'), updateLineItemMonths);

// Create/Edit/Delete line items - Editor, Approver, Admin
router.post('/', checkPermission('CREATE_LINE_ITEMS'), createLineItem);
router.put('/:id', checkPermission('EDIT_LINE_ITEMS'), updateLineItem);
router.delete('/:id', checkPermission('DELETE_LINE_ITEMS'), deleteLineItem);

module.exports = router;
