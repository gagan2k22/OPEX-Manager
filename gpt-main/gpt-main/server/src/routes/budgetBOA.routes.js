const express = require('express');
const router = express.Router();
const budgetBOAController = require('../controllers/budgetBOA.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, budgetBOAController.getAllBudgetBOA);
router.post('/', authenticate, budgetBOAController.createBudgetBOA);
router.put('/:id', authenticate, budgetBOAController.updateBudgetBOA);
router.delete('/:id', authenticate, budgetBOAController.deleteBudgetBOA);
router.post('/seed', authenticate, budgetBOAController.seedBudgetBOA);

module.exports = router;
