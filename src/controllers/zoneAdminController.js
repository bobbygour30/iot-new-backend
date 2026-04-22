// src/controllers/zoneAdminController.js
const CompanyZone = require('../models/CompanyZone');
const Plant = require('../models/Plant');
const Device = require('../models/Device');

// @desc    Get all zones
// @route   GET /api/admin/zones
// @access  Private/Super Admin
const getAllZones = async (req, res) => {
  try {
    const zones = await CompanyZone.find().sort({ createdAt: -1 });
    
    // Get stats for each zone
    const zonesWithStats = await Promise.all(zones.map(async (zone) => {
      const plants = await Plant.find({ userId: zone.userId });
      const devices = await Device.find({ userId: zone.userId });
      const users = await require('../models/User').find({ _id: zone.userId });
      
      return {
        ...zone.toObject(),
        plants: plants.length,
        devices: devices.length,
        users: users.length
      };
    }));
    
    res.status(200).json({
      success: true,
      data: zonesWithStats
    });
  } catch (error) {
    console.error('Get zones error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create zone
// @route   POST /api/admin/zones
// @access  Private/Super Admin
const createZone = async (req, res) => {
  try {
    const { zoneName, companyName, address, state, city, pinCode, status } = req.body;
    
    const zone = await CompanyZone.create({
      zoneName,
      companyName,
      address,
      state,
      city,
      pinCode,
      isActive: status === 'active',
      userId: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Zone created successfully',
      data: zone
    });
  } catch (error) {
    console.error('Create zone error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update zone
// @route   PUT /api/admin/zones/:id
// @access  Private/Super Admin
const updateZone = async (req, res) => {
  try {
    const zone = await CompanyZone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Zone updated successfully',
      data: zone
    });
  } catch (error) {
    console.error('Update zone error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete zone
// @route   DELETE /api/admin/zones/:id
// @access  Private/Super Admin
const deleteZone = async (req, res) => {
  try {
    const zone = await CompanyZone.findByIdAndDelete(req.params.id);
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Zone deleted successfully'
    });
  } catch (error) {
    console.error('Delete zone error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllZones,
  createZone,
  updateZone,
  deleteZone
};