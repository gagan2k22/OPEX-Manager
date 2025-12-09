const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
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
router.use(authenticateToken);

// Towers
router.get('/towers', getTowers);
router.post('/towers', authorizeRoles('Admin'), createTower);
router.put('/towers/:id', authorizeRoles('Admin'), updateTower);
router.delete('/towers/:id', authorizeRoles('Admin'), deleteTower);

// Budget Heads
router.get('/budget-heads', getBudgetHeads);
router.post('/budget-heads', authorizeRoles('Admin'), createBudgetHead);
router.put('/budget-heads/:id', authorizeRoles('Admin'), updateBudgetHead);
router.delete('/budget-heads/:id', authorizeRoles('Admin'), deleteBudgetHead);

// Vendors
router.get('/vendors', getVendors);
router.post('/vendors', authorizeRoles('Admin'), createVendor);
router.put('/vendors/:id', authorizeRoles('Admin'), updateVendor);
router.delete('/vendors/:id', authorizeRoles('Admin'), deleteVendor);

// Cost Centres
router.get('/cost-centres', getCostCentres);
router.post('/cost-centres', authorizeRoles('Admin'), createCostCentre);
router.put('/cost-centres/:id', authorizeRoles('Admin'), updateCostCentre);
router.delete('/cost-centres/:id', authorizeRoles('Admin'), deleteCostCentre);

// PO Entities
router.get('/po-entities', getPOEntities);
router.post('/po-entities', authorizeRoles('Admin'), createPOEntity);
router.put('/po-entities/:id', authorizeRoles('Admin'), updatePOEntity);
router.delete('/po-entities/:id', authorizeRoles('Admin'), deletePOEntity);

// Service Types
router.get('/service-types', getServiceTypes);
router.post('/service-types', authorizeRoles('Admin'), createServiceType);
router.put('/service-types/:id', authorizeRoles('Admin'), updateServiceType);
router.delete('/service-types/:id', authorizeRoles('Admin'), deleteServiceType);

// Allocation Bases
router.get('/allocation-bases', getAllocationBases);
router.post('/allocation-bases', authorizeRoles('Admin'), createAllocationBasis);
router.put('/allocation-bases/:id', authorizeRoles('Admin'), updateAllocationBasis);
router.delete('/allocation-bases/:id', authorizeRoles('Admin'), deleteAllocationBasis);

module.exports = router;
