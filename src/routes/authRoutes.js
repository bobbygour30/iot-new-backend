const express = require('express');
const { register, login, getMe, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { registerValidation, loginValidation } = require('../utils/validators');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

module.exports = router;