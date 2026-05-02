// src/controllers/plantController.js
const Plant = require('../models/Plant');
const Zone = require('../models/Zone');
const Device = require('../models/Device');

// @desc    Create a new plant
// @route   POST /api/plants
// @access  Private
const createPlant = async (req, res) => {
  try {
    const { name, location, description } = req.body;
    const userId = req.user.id;

    // Check if plant already exists for this user
    const existingPlant = await Plant.findOne({ name, userId });
    if (existingPlant) {
      return res.status(400).json({
        success: false,
        message: 'Plant with this name already exists'
      });
    }

    const plant = await Plant.create({
      name,
      location,
      description,
      userId
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
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all plants for user
// @route   GET /api/plants
// @access  Private
const getPlants = async (req, res) => {
  try {
    const plants = await Plant.find({ userId: req.user.id, isActive: true })
      .sort({ createdAt: -1 });

    // Get zones and devices count for each plant
    const plantsWithStats = await Promise.all(plants.map(async (plant) => {
      const zones = await Zone.find({ plantId: plant._id, isActive: true });
      const devices = await Device.find({ plantId: plant._id, isActive: true });
      
      return {
        ...plant.toObject(),
        zonesCount: zones.length,
        devicesCount: devices.length
      };
    }));

    res.status(200).json({
      success: true,
      data: plantsWithStats
    });
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single plant
// @route   GET /api/plants/:id
// @access  Private
const getPlant = async (req, res) => {
  try {
    const plant = await Plant.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    const zones = await Zone.find({ plantId: plant._id, isActive: true });
    const devices = await Device.find({ plantId: plant._id, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        ...plant.toObject(),
        zones,
        devices
      }
    });
  } catch (error) {
    console.error('Get plant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update plant
// @route   PUT /api/plants/:id
// @access  Private
const updatePlant = async (req, res) => {
  try {
    const plant = await Plant.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
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
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete plant (soft delete)
// @route   DELETE /api/plants/:id
// @access  Private
const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false },
      { new: true }
    );

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    // Soft delete all zones and devices under this plant
    await Zone.updateMany(
      { plantId: plant._id },
      { isActive: false }
    );
    await Device.updateMany(
      { plantId: plant._id },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Plant deleted successfully'
    });
  } catch (error) {
    console.error('Delete plant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createPlant,
  getPlants,
  getPlant,
  updatePlant,
  deletePlant
};