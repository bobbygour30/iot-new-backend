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

// ==================== AUTH ROUTES ====================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', getMe);
router.post('/auth/logout', logout);
router.post('/auth/create-super-admin', createSuperAdmin);

// ==================== ADMIN DASHBOARD ROUTES ====================
router.get('/admin/stats', getDashboardStats);
router.get('/admin/growth-data', getGrowthData);
router.get('/admin/recent-users', getRecentUsers);

// ==================== ADMIN USER ROUTES ====================
router.get('/admin/users', getAllUsers);
router.get('/admin/users/:id', getUserById);
router.post('/admin/users', createUser);
router.put('/admin/users/:id', updateUser);
router.delete('/admin/users/:id', deleteUser);
router.patch('/admin/users/:id/toggle-status', toggleUserStatus);

// ==================== ADMIN ZONE ROUTES ====================
router.get('/admin/zones', getAllZones);
router.post('/admin/zones', createZone);
router.put('/admin/zones/:id', updateZone);
router.delete('/admin/zones/:id', deleteZone);

// ==================== ADMIN PLANT ROUTES ====================
router.get('/admin/plants', getAllPlants);
router.post('/admin/plants', createPlant);
router.put('/admin/plants/:id', updatePlant);
router.delete('/admin/plants/:id', deletePlant);

// ==================== ADMIN DEVICE ROUTES ====================
router.get('/admin/devices', getAllDevices);
router.post('/admin/devices', registerDevice);
router.put('/admin/devices/:id', updateDevice);
router.delete('/admin/devices/:id', deleteDevice);
router.patch('/admin/devices/:id/status', updateDeviceStatus);

// ==================== USER PLANT ROUTES ====================
router.get('/plants', getAllPlants);
router.post('/plants', createPlant);
router.put('/plants/:id', updatePlant);
router.delete('/plants/:id', deletePlant);

// ==================== USER ZONE ROUTES ====================
router.get('/zones', getAllZones);
router.post('/zones', createZone);
router.put('/zones/:id', updateZone);
router.delete('/zones/:id', deleteZone);

// ==================== USER DEVICE ROUTES ====================
router.get('/devices', getAllDevices);
router.post('/devices', registerDevice);
router.put('/devices/:id', updateDevice);
router.delete('/devices/:id', deleteDevice);
router.post('/devices/:deviceId/reading', (req, res) => {
  // This would be handled by a separate controller
  res.json({ success: true });
});

module.exports = router;