const express = require('express');
const { register, login, getMe, logout, createSuperAdmin } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { registerValidation, loginValidation } = require('../utils/validators');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);
// Add this route to src/routes/authRoutes.js
router.post('/create-super-admin', createSuperAdmin);

module.exports = router;