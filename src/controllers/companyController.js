const CompanyZone  = require('../models/Company');

// @desc    Get zone details
// @route   GET /api/zones
// @access  Private
const getZone = async (req, res) => {
  try {
    const zone = await Zone.findOne({ userId: req.user.id });
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    res.status(200).json({
      success: true,
      data: zone
    });
  } catch (error) {
    console.error('Get zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update zone settings
// @route   PUT /api/zones/settings
// @access  Private
const updateZoneSettings = async (req, res) => {
  try {
    const { temperatureThreshold, humidityThreshold, vocThreshold, alertEnabled } = req.body;
    
    const zone = await Zone.findOne({ userId: req.user.id });
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    // Update settings
    if (temperatureThreshold) zone.settings.temperatureThreshold = temperatureThreshold;
    if (humidityThreshold) zone.settings.humidityThreshold = humidityThreshold;
    if (vocThreshold) zone.settings.vocThreshold = vocThreshold;
    if (alertEnabled !== undefined) zone.settings.alertEnabled = alertEnabled;

    await zone.save();

    res.status(200).json({
      success: true,
      message: 'Zone settings updated successfully',
      data: zone.settings
    });
  } catch (error) {
    console.error('Update zone settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update zone metadata
// @route   PUT /api/zones/metadata
// @access  Private
const updateZoneMetadata = async (req, res) => {
  try {
    const { deviceCount, totalReadings } = req.body;
    
    const zone = await Zone.findOne({ userId: req.user.id });
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    if (deviceCount !== undefined) zone.metadata.deviceCount = deviceCount;
    if (totalReadings !== undefined) zone.metadata.totalReadings = totalReadings;

    await zone.save();

    res.status(200).json({
      success: true,
      message: 'Zone metadata updated successfully',
      data: zone.metadata
    });
  } catch (error) {
    console.error('Update zone metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getZone,
  updateZoneSettings,
  updateZoneMetadata
};