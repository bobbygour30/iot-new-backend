const express = require('express');
const {
  registerDevice,
  getDevicesByZone,
  getDevicesByPlant,
  getDevice,
  updateDevice,
  deleteDevice,
  updateDeviceReading
} = require('../controllers/deviceController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route for sensor data
router.post('/:deviceId/reading', updateDeviceReading);

// Protected routes
router.use(authMiddleware);

router.route('/')
  .post(registerDevice);

router.route('/zone/:zoneId')
  .get(getDevicesByZone);

router.route('/plant/:plantId')
  .get(getDevicesByPlant);

router.route('/:id')
  .get(getDevice)
  .put(updateDevice)
  .delete(deleteDevice);

module.exports = router;