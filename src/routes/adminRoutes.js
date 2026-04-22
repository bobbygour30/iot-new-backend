// src/routes/adminRoutes.js
const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getGrowthData,
  getRecentUsers
} = require('../controllers/adminController');

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require('../controllers/userController');

const {
  getAllZones,
  createZone,
  updateZone,
  deleteZone
} = require('../controllers/zoneAdminController');

const {
  getAllPlants,
  createPlant,
  updatePlant,
  deletePlant
} = require('../controllers/plantAdminController');

const {
  getAllDevices,
  registerDevice,
  updateDevice,
  deleteDevice,
  updateDeviceStatus
} = require('../controllers/deviceAdminController');

const router = express.Router();

// All admin routes require authentication and super_admin role
router.use(authMiddleware);
router.use(authorize('super_admin'));

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/growth-data', getGrowthData);
router.get('/recent-users', getRecentUsers);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Zone management routes
router.get('/zones', getAllZones);
router.post('/zones', createZone);
router.put('/zones/:id', updateZone);
router.delete('/zones/:id', deleteZone);

// Plant management routes
router.get('/plants', getAllPlants);
router.post('/plants', createPlant);
router.put('/plants/:id', updatePlant);
router.delete('/plants/:id', deletePlant);

// Device management routes
router.get('/devices', getAllDevices);
router.post('/devices', registerDevice);
router.put('/devices/:id', updateDevice);
router.delete('/devices/:id', deleteDevice);
router.patch('/devices/:id/status', updateDeviceStatus);

module.exports = router;