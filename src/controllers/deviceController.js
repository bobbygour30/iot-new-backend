const Device = require('../models/Device');
const Zone = require('../models/Zone');
const Plant = require('../models/Plant');

// @desc    Register a new device
// @route   POST /api/devices
// @access  Private
const registerDevice = async (req, res) => {
  try {
    const { deviceId, type, model, location, thresholds, plantId, zoneId } = req.body;
    const userId = req.user.id;

    // Check if device already exists
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: 'Device with this ID already exists'
      });
    }

    // Verify plant and zone belong to user
    const plant = await Plant.findOne({ _id: plantId, userId, isActive: true });
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    const zone = await Zone.findOne({ _id: zoneId, plantId, userId, isActive: true });
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    const device = await Device.create({
      deviceId,
      type,
      model,
      location,
      thresholds,
      plantId,
      zoneId,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: device
    });
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all devices for a zone
// @route   GET /api/devices/zone/:zoneId
// @access  Private
const getDevicesByZone = async (req, res) => {
  try {
    const devices = await Device.find({
      zoneId: req.params.zoneId,
      userId: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all devices for a plant
// @route   GET /api/devices/plant/:plantId
// @access  Private
const getDevicesByPlant = async (req, res) => {
  try {
    const devices = await Device.find({
      plantId: req.params.plantId,
      userId: req.user.id,
      isActive: true
    }).populate('zoneId', 'name');

    res.status(200).json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single device
// @route   GET /api/devices/:id
// @access  Private
const getDevice = async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    }).populate('plantId zoneId');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update device
// @route   PUT /api/devices/:id
// @access  Private
const updateDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      data: device
    });
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete device (soft delete)
// @route   DELETE /api/devices/:id
// @access  Private
const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update device last reading
// @route   POST /api/devices/:deviceId/reading
// @access  Public (for sensor data)
const updateDeviceReading = async (req, res) => {
  try {
    const { temperature, humidity, voc } = req.body;
    const { deviceId } = req.params;

    const device = await Device.findOne({ deviceId, isActive: true });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    device.lastReading = {
      temperature,
      humidity,
      voc,
      timestamp: new Date()
    };
    await device.save();

    res.status(200).json({
      success: true,
      message: 'Device reading updated'
    });
  } catch (error) {
    console.error('Update device reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  registerDevice,
  getDevicesByZone,
  getDevicesByPlant,
  getDevice,
  updateDevice,
  deleteDevice,
  updateDeviceReading
};