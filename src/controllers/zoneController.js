const Zone = require('../models/Zone');
const Device = require('../models/Device');

// @desc    Create a new zone
// @route   POST /api/zones
// @access  Private
const createZone = async (req, res) => {
  try {
    const { name, area, purpose, plantId } = req.body;
    const userId = req.user.id;

    // Check if zone already exists for this plant
    const existingZone = await Zone.findOne({ name, plantId });
    if (existingZone) {
      return res.status(400).json({
        success: false,
        message: 'Zone with this name already exists in this plant'
      });
    }

    const zone = await Zone.create({
      name,
      area,
      purpose,
      plantId,
      userId
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
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all zones for a plant
// @route   GET /api/zones/plant/:plantId
// @access  Private
const getZonesByPlant = async (req, res) => {
  try {
    const zones = await Zone.find({
      plantId: req.params.plantId,
      userId: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 });

    // Get devices count for each zone
    const zonesWithStats = await Promise.all(zones.map(async (zone) => {
      const devices = await Device.find({ zoneId: zone._id, isActive: true });
      return {
        ...zone.toObject(),
        devicesCount: devices.length
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
      message: 'Server error'
    });
  }
};

// @desc    Get single zone
// @route   GET /api/zones/:id
// @access  Private
const getZone = async (req, res) => {
  try {
    const zone = await Zone.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    const devices = await Device.find({ zoneId: zone._id, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        ...zone.toObject(),
        devices
      }
    });
  } catch (error) {
    console.error('Get zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update zone
// @route   PUT /api/zones/:id
// @access  Private
const updateZone = async (req, res) => {
  try {
    const zone = await Zone.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
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
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete zone (soft delete)
// @route   DELETE /api/zones/:id
// @access  Private
const deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false },
      { new: true }
    );

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found'
      });
    }

    // Soft delete all devices under this zone
    await Device.updateMany(
      { zoneId: zone._id },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Zone deleted successfully'
    });
  } catch (error) {
    console.error('Delete zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createZone,
  getZonesByPlant,
  getZone,
  updateZone,
  deleteZone
};