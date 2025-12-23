const express = require('express');
const { authenticate } = require('../middleware/auth');
const nenoController = require('../controllers/neno.controller');

const router = express.Router();

router.use(authenticate);

// Chat with Neno
router.post('/chat', nenoController.processChat);

module.exports = router;
