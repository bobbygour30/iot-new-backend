// src/routes/api.js
const express = require('express');
const router = express.Router();

// Import all controllers
const { register, login, getMe, logout, createSuperAdmin } = require('../controllers/authController');
const { getAllPlants, createPlant, updatePlant, deletePlant } = require('../controllers/plantAdminController');
const { getAllZones, createZone, updateZone, deleteZone } = require('../controllers/zoneAdminController');
const { getAllDevices, registerDevice, updateDevice, deleteDevice, updateDeviceStatus } = require('../controllers/deviceAdminController');
const { getDashboardStats, getGrowthData, getRecentUsers } = require('../controllers/adminController');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, toggleUserStatus } = require('../controllers/userController');

// Import user routes controllers
const plantController = require('../controllers/plantController');
const zoneController = require('../controllers/zoneController');
const deviceController = require('../controllers/deviceController');

// Import auth middleware
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// ==================== AUTH ROUTES (Public) ====================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/create-super-admin', createSuperAdmin);
router.get('/auth/me', authMiddleware, getMe);
router.post('/auth/logout', authMiddleware, logout);

// ==================== USER PLANT ROUTES (Regular users) ====================
router.get('/plants', authMiddleware, plantController.getPlants);
router.get('/plants/:id', authMiddleware, plantController.getPlant);
router.post('/plants', authMiddleware, plantController.createPlant);
router.put('/plants/:id', authMiddleware, plantController.updatePlant);
router.delete('/plants/:id', authMiddleware, plantController.deletePlant);

// ==================== USER ZONE ROUTES ====================
router.get('/zones/plant/:plantId', authMiddleware, zoneController.getZonesByPlant);
router.get('/zones/:id', authMiddleware, zoneController.getZone);
router.post('/zones', authMiddleware, zoneController.createZone);
router.put('/zones/:id', authMiddleware, zoneController.updateZone);
router.delete('/zones/:id', authMiddleware, zoneController.deleteZone);

// ==================== USER DEVICE ROUTES ====================
router.get('/devices/zone/:zoneId', authMiddleware, deviceController.getDevicesByZone);
router.get('/devices/plant/:plantId', authMiddleware, deviceController.getDevicesByPlant);
router.get('/devices/:id', authMiddleware, deviceController.getDevice);
router.post('/devices', authMiddleware, deviceController.registerDevice);
router.put('/devices/:id', authMiddleware, deviceController.updateDevice);
router.delete('/devices/:id', authMiddleware, deviceController.deleteDevice);
router.post('/devices/:deviceId/reading', deviceController.updateDeviceReading); // Public

// ==================== ADMIN ROUTES (require super_admin role) ====================
const adminAuth = [authMiddleware, authorize('super_admin')];

// Dashboard routes
router.get('/admin/stats', adminAuth, getDashboardStats);
router.get('/admin/growth-data', adminAuth, getGrowthData);
router.get('/admin/recent-users', adminAuth, getRecentUsers);

// Admin User management
router.get('/admin/users', adminAuth, getAllUsers);
router.get('/admin/users/:id', adminAuth, getUserById);
router.post('/admin/users', adminAuth, createUser);
router.put('/admin/users/:id', adminAuth, updateUser);
router.delete('/admin/users/:id', adminAuth, deleteUser);
router.patch('/admin/users/:id/toggle-status', adminAuth, toggleUserStatus);

// Admin Zone management
router.get('/admin/zones', adminAuth, getAllZones);
router.post('/admin/zones', adminAuth, createZone);
router.put('/admin/zones/:id', adminAuth, updateZone);
router.delete('/admin/zones/:id', adminAuth, deleteZone);

// Admin Plant management
router.get('/admin/plants', adminAuth, getAllPlants);
router.post('/admin/plants', adminAuth, createPlant);
router.put('/admin/plants/:id', adminAuth, updatePlant);
router.delete('/admin/plants/:id', adminAuth, deletePlant);

// Admin Device management
router.get('/admin/devices', adminAuth, getAllDevices);
router.post('/admin/devices', adminAuth, registerDevice);
router.put('/admin/devices/:id', adminAuth, updateDevice);
router.delete('/admin/devices/:id', adminAuth, deleteDevice);
router.patch('/admin/devices/:id/status', adminAuth, updateDeviceStatus);

module.exports = router;