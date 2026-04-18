const express = require('express');
const { getZone, updateZoneSettings, updateZoneMetadata } = require('../controllers/companyController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.get('/', getZone);
router.put('/settings', updateZoneSettings);
router.put('/metadata', updateZoneMetadata);

module.exports = router;