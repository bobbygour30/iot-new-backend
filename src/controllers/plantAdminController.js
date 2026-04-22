// src/controllers/plantAdminController.js
const Plant = require('../models/Plant');
const Device = require('../models/Device');

// @desc    Get all plants
// @route   GET /api/admin/plants
// @access  Private/Super Admin
const getAllPlants = async (req, res) => {
  try {
    const plants = await Plant.find().sort({ createdAt: -1 });
    
    // Get device count for each plant
    const plantsWithDevices = await Promise.all(plants.map(async (plant) => {
      const devices = await Device.find({ plantId: plant._id });
      return {
        ...plant.toObject(),
        devices: devices.length
      };
    }));
    
    res.status(200).json({
      success: true,
      data: plantsWithDevices
    });
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create plant
// @route   POST /api/admin/plants
// @access  Private/Super Admin
const createPlant = async (req, res) => {
  try {
    const { name, type, location, description, zone, status } = req.body;
    
    const plant = await Plant.create({
      name,
      type,
      location,
      description,
      isActive: status === 'active',
      userId: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Plant created successfully',
      data: plant
    });
  } catch (error) {
    console.error('Create plant error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update plant
// @route   PUT /api/admin/plants/:id
// @access  Private/Super Admin
const updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Plant updated successfully',
      data: plant
    });
  } catch (error) {
    console.error('Update plant error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete plant
// @route   DELETE /api/admin/plants/:id
// @access  Private/Super Admin
const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);
    
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }
    
    // Also delete all devices under this plant
    await Device.deleteMany({ plantId: plant._id });
    
    res.status(200).json({
      success: true,
      message: 'Plant deleted successfully'
    });
  } catch (error) {
    console.error('Delete plant error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllPlants,
  createPlant,
  updatePlant,
  deletePlant
};