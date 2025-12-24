const express = require('express');
const { authenticate, restrictTo } = require('../middleware/auth');
const masterController = require('../controllers/masterData.controller');
const {
    getEntities, createEntity, updateEntity, deleteEntity,
    getServices, createService, updateService, deleteService
} = masterController;

const router = express.Router();

router.use(authenticate);

// Entity Master (Business Units)
router.get('/entities', getEntities);
router.post('/entities', restrictTo('Admin'), createEntity);
router.put('/entities/:id', restrictTo('Admin'), updateEntity);
router.delete('/entities/:id', restrictTo('Admin'), deleteEntity);

// Service/UID Master (Contracts)
router.get('/services', getServices);
router.post('/services', restrictTo('Admin'), createService);
router.put('/services/:id', restrictTo('Admin'), updateService);
router.delete('/services/:id', restrictTo('Admin'), deleteService);

// PO Entity Master
router.get('/po-entities', masterController.getPOEntities);
router.post('/po-entities', restrictTo('Admin'), masterController.createPOEntity);
router.put('/po-entities/:id', restrictTo('Admin'), masterController.updatePOEntity);
router.delete('/po-entities/:id', restrictTo('Admin'), masterController.deletePOEntity);

// Budget Head Master
router.get('/budget-heads', masterController.getBudgetHeads);
router.post('/budget-heads', restrictTo('Admin'), masterController.createBudgetHead);
router.put('/budget-heads/:id', restrictTo('Admin'), masterController.updateBudgetHead);
router.delete('/budget-heads/:id', restrictTo('Admin'), masterController.deleteBudgetHead);

// Tower Master
router.get('/towers', masterController.getTowers);
router.post('/towers', restrictTo('Admin'), masterController.createTower);
router.put('/towers/:id', restrictTo('Admin'), masterController.updateTower);
router.delete('/towers/:id', restrictTo('Admin'), masterController.deleteTower);

// Allocation Type Master
router.get('/allocation-types', masterController.getAllocationTypes);
router.post('/allocation-types', restrictTo('Admin'), masterController.createAllocationType);
router.put('/allocation-types/:id', restrictTo('Admin'), masterController.updateAllocationType);
router.delete('/allocation-types/:id', restrictTo('Admin'), masterController.deleteAllocationType);

// Allocation Basis Master
router.get('/allocation-bases', masterController.getAllocationBases);
router.post('/allocation-bases', restrictTo('Admin'), masterController.createAllocationBasis);
router.put('/allocation-bases/:id', restrictTo('Admin'), masterController.updateAllocationBasis);
router.delete('/allocation-bases/:id', restrictTo('Admin'), masterController.deleteAllocationBasis);

module.exports = router;
