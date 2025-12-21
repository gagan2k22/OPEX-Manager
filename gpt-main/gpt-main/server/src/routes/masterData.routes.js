const express = require('express');
const { authenticate, restrictTo } = require('../middleware/auth');
const {
    getTowers, createTower, updateTower, deleteTower,
    getBudgetHeads, createBudgetHead, updateBudgetHead, deleteBudgetHead,
    getVendors, createVendor, updateVendor, deleteVendor,
    getCostCentres, createCostCentre, updateCostCentre, deleteCostCentre,
    getPOEntities, createPOEntity, updatePOEntity, deletePOEntity,
    getServiceTypes, createServiceType, updateServiceType, deleteServiceType,
    getAllocationBases, createAllocationBasis, updateAllocationBasis, deleteAllocationBasis
} = require('../controllers/masterData.controller');

const router = express.Router();

// Public read access for authenticated users, Write access for Admins/Editors
router.use(authenticate);

// Towers
router.get('/towers', getTowers);
router.post('/towers', restrictTo('Admin'), createTower);
router.put('/towers/:id', restrictTo('Admin'), updateTower);
router.delete('/towers/:id', restrictTo('Admin'), deleteTower);

// Budget Heads
router.get('/budget-heads', getBudgetHeads);
router.post('/budget-heads', restrictTo('Admin'), createBudgetHead);
router.put('/budget-heads/:id', restrictTo('Admin'), updateBudgetHead);
router.delete('/budget-heads/:id', restrictTo('Admin'), deleteBudgetHead);

// Vendors
router.get('/vendors', getVendors);
router.post('/vendors', restrictTo('Admin'), createVendor);
router.put('/vendors/:id', restrictTo('Admin'), updateVendor);
router.delete('/vendors/:id', restrictTo('Admin'), deleteVendor);

// Cost Centres
router.get('/cost-centres', getCostCentres);
router.post('/cost-centres', restrictTo('Admin'), createCostCentre);
router.put('/cost-centres/:id', restrictTo('Admin'), updateCostCentre);
router.delete('/cost-centres/:id', restrictTo('Admin'), deleteCostCentre);

// PO Entities
router.get('/po-entities', getPOEntities);
router.post('/po-entities', restrictTo('Admin'), createPOEntity);
router.put('/po-entities/:id', restrictTo('Admin'), updatePOEntity);
router.delete('/po-entities/:id', restrictTo('Admin'), deletePOEntity);

// Service Types
router.get('/service-types', getServiceTypes);
router.post('/service-types', restrictTo('Admin'), createServiceType);
router.put('/service-types/:id', restrictTo('Admin'), updateServiceType);
router.delete('/service-types/:id', restrictTo('Admin'), deleteServiceType);

// Allocation Bases
router.get('/allocation-bases', getAllocationBases);
router.post('/allocation-bases', restrictTo('Admin'), createAllocationBasis);
router.put('/allocation-bases/:id', restrictTo('Admin'), updateAllocationBasis);
router.delete('/allocation-bases/:id', restrictTo('Admin'), deleteAllocationBasis);

module.exports = router;
