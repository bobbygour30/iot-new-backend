// src/controllers/deviceAdminController.js
const Device = require('../models/Device');
const Plant = require('../models/Plant');

// @desc    Get all devices
// @route   GET /api/admin/devices
// @access  Private/Super Admin
const getAllDevices = async (req, res) => {
  try {
    const { search = '', status = 'all', zone = 'all' } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { deviceId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      query.status = status;
    }
    
    const devices = await Device.find(query)
      .populate('plantId', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register device
// @route   POST /api/admin/devices
// @access  Private/Super Admin
const registerDevice = async (req, res) => {
  try {
    const { deviceId, type, model, location, thresholds, plantId, zoneId } = req.body;
    
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: 'Device ID already exists'
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
      userId: req.user.id,
      status: 'offline'
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
      message: error.message
    });
  }
};

// @desc    Update device
// @route   PUT /api/admin/devices/:id
// @access  Private/Super Admin
const updateDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
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
      message: error.message
    });
  }
};

// @desc    Delete device
// @route   DELETE /api/admin/devices/:id
// @access  Private/Super Admin
const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    
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
      message: error.message
    });
  }
};

// @desc    Update device status
// @route   PATCH /api/admin/devices/:id/status
// @access  Private/Super Admin
const updateDeviceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { status },
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
      message: 'Device status updated',
      data: device
    });
  } catch (error) {
    console.error('Update device status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllDevices,
  registerDevice,
  updateDevice,
  deleteDevice,
  updateDeviceStatus
};