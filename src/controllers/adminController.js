// src/controllers/adminController.js
const User = require('../models/User');
const CompanyZone = require('../models/CompanyZone');
const Plant = require('../models/Plant');
const Device = require('../models/Device');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Super Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalZones = await CompanyZone.countDocuments();
    const activeZones = await CompanyZone.countDocuments({ isActive: true });
    const totalPlants = await Plant.countDocuments();
    const activePlants = await Plant.countDocuments({ isActive: true });
    const totalDevices = await Device.countDocuments();
    const onlineDevices = await Device.countDocuments({ status: 'online' });
    const alerts = await Device.countDocuments({ status: 'offline' });
    const criticalAlerts = await Device.countDocuments({ status: 'maintenance' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalZones,
        activeZones,
        totalPlants,
        activePlants,
        totalDevices,
        onlineDevices,
        alerts,
        criticalAlerts
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get growth chart data
// @route   GET /api/admin/growth-data
// @access  Private/Super Admin
const getGrowthData = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const devices = await Device.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map((month, index) => ({
      month,
      users: users.find(u => u._id === index + 1)?.count || 0,
      devices: devices.find(d => d._id === index + 1)?.count || 0
    }));

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Get growth data error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recent users
// @route   GET /api/admin/recent-users
// @access  Private/Super Admin
const getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-password');

    res.status(200).json({
      success: true,
      data: recentUsers
    });
  } catch (error) {
    console.error('Get recent users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getGrowthData,
  getRecentUsers
};