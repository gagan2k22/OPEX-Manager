const express = require('express');
const { authenticate, restrictTo } = require('../middleware/auth');
const masterController = require('../controllers/masterData.controller');
const {
    getEntities, createEntity,
    getServices, createService
} = masterController;

const router = express.Router();

router.use(authenticate);

// Entity Master (Business Units)
router.get('/entities', getEntities);
router.post('/entities', restrictTo('Admin'), createEntity);

// Service/UID Master (Contracts)
router.get('/services', getServices);
router.post('/services', restrictTo('Admin'), createService);

// PO Entity Master
router.get('/po-entities', masterController.getPOEntities);
router.post('/po-entities', restrictTo('Admin'), masterController.createPOEntity);

// Budget Head Master
router.get('/budget-heads', masterController.getBudgetHeads);
router.post('/budget-heads', restrictTo('Admin'), masterController.createBudgetHead);

// Tower Master
router.get('/towers', masterController.getTowers);
router.post('/towers', restrictTo('Admin'), masterController.createTower);

// Allocation Type Master
router.get('/allocation-types', masterController.getAllocationTypes);
router.post('/allocation-types', restrictTo('Admin'), masterController.createAllocationType);

// Allocation Basis Master
router.get('/allocation-bases', masterController.getAllocationBases);
router.post('/allocation-bases', restrictTo('Admin'), masterController.createAllocationBasis);

module.exports = router;
