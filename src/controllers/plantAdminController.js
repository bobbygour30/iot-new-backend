// src/controllers/plantAdminController.js
const Plant = require('../models/Plant');
const Device = require('../models/Device');

// @desc    Get all plants
// @route   GET /api/admin/plants
// @access  Private/Super Admin
const getAllPlants = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
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
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const { name, location, description, status } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Plant name is required'
      });
    }
    
    const userId = req.user._id || req.user.id;
    
    const plant = await Plant.create({
      name: name.trim(),
      location: location || '',
      description: description || '',
      isActive: status === 'active',
      userId: userId
    });
    
    res.status(201).json({
      success: true,
      message: 'Plant created successfully',
      data: plant
    });
  } catch (error) {
    console.error('Create plant error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A plant with this name already exists'
      });
    }
    
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
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    const { name, location, description, isActive } = req.body;
    
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }
    
    if (name) plant.name = name;
    if (location !== undefined) plant.location = location;
    if (description !== undefined) plant.description = description;
    if (isActive !== undefined) plant.isActive = isActive;
    
    await plant.save();
    
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
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
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