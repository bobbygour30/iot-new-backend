const Device = require('../models/Device');
const Zone = require('../models/Zone');
const Plant = require('../models/Plant');

// @desc    Register a new device
// @route   POST /api/devices
// @access  Private
const registerDevice = async (req, res) => {
  try {
    const { deviceId, type, plantId, zoneId } = req.body;
    const userId = req.user.id;

    // Check if device already exists for this user
    const existingDevice = await Device.findOne({ deviceId, userId, isActive: true });
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: 'Device with this ID already exists in your account'
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
      type: type || 'Multi-Sensor',
      plantId,
      zoneId,
      userId,
      status: 'offline'
    });

    res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: device
    });
  } catch (error) {
    console.error('Register device error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Device with this ID already exists'
      });
    }
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
    const { deviceId, type, model, location, thresholds } = req.body;
    
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Check if new deviceId conflicts with another device
    if (deviceId && deviceId !== device.deviceId) {
      const existingDevice = await Device.findOne({
        deviceId,
        userId: req.user.id,
        _id: { $ne: device._id }
      });
      if (existingDevice) {
        return res.status(400).json({
          success: false,
          message: 'Device with this ID already exists'
        });
      }
      device.deviceId = deviceId;
    }

    if (type) device.type = type;
    if (model !== undefined) device.model = model;
    if (location !== undefined) device.location = location;
    if (thresholds) {
      device.thresholds = {
        ...device.thresholds,
        ...thresholds
      };
    }
    
    await device.save();

    res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      data: device
    });
  } catch (error) {
    console.error('Update device error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Device with this ID already exists'
      });
    }
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

// @desc    Update device last reading (for sensor data)
// @route   POST /api/devices/:deviceId/reading
// @access  Public
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
    
    // Auto-update status based on recent reading
    device.status = 'online';
    await device.save();

    res.status(200).json({
      success: true,
      message: 'Device reading updated',
      data: device
    });
  } catch (error) {
    console.error('Update device reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get device by deviceId (for validation)
// @route   GET /api/devices/validate/:deviceId
// @access  Private
const validateDeviceId = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user.id;

    // Check if device already exists for this user
    const existingDevice = await Device.findOne({ deviceId, userId, isActive: true });
    
    res.status(200).json({
      success: true,
      data: {
        exists: !!existingDevice,
        device: existingDevice
      }
    });
  } catch (error) {
    console.error('Validate device error:', error);
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
  updateDeviceReading,
  validateDeviceId
};