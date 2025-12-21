const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validator');
const { loginLimiter } = require('../middleware/security');

// Apply rate limiting to login
router.post('/login', loginLimiter, validate('login'), login);

router.post('/register', validate('register'), register);

module.exports = router;
