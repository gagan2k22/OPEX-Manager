const express = require('express');
const router = express.Router();
const actualBOAController = require('../controllers/actualBOA.controller');
const { authenticate } = require('../middleware/auth');

// Public or protected routes - adjust permission as needed
// Assuming these should be protected
router.get('/', authenticate, actualBOAController.getAllActualBOA);
router.post('/', authenticate, actualBOAController.createActualBOA);
router.put('/:id', authenticate, actualBOAController.updateActualBOA);
router.delete('/:id', authenticate, actualBOAController.deleteActualBOA);
router.post('/seed', authenticate, actualBOAController.seedActualBOA);

module.exports = router;
