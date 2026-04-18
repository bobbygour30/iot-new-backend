const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Zone = require('../models/Company');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register new zone user
// @route   POST /api/auth/register
// @access  Public
// src/controllers/authController.js (updated register function)
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      companyName,
      zoneName,
      address,
      state,
      city,
      pinCode
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user with firstName and lastName
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone
    });

    // Create zone for user (without plantName, with address)
    const zone = await Zone.create({
      zoneName,
      companyName,
      address,
      state,
      city,
      pinCode,
      userId: user._id
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt
        },
        zone: {
          id: zone._id,
          zoneName: zone.zoneName,
          companyName: zone.companyName,
          address: zone.address,
          state: zone.state,
          city: zone.city,
          pinCode: zone.pinCode
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};
// @desc    Login zone user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, zoneName } = req.body;

    // Check if user exists with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if zone exists for user
    const zone = await Zone.findOne({ 
      userId: user._id,
      zoneName: zoneName 
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: `Zone '${zoneName}' not found for this user`
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          lastLogin: user.lastLogin
        },
        zone: {
          id: zone._id,
          zoneName: zone.zoneName,
          companyName: zone.companyName,
          plantName: zone.plantName,
          state: zone.state,
          city: zone.city,
          pinCode: zone.pinCode,
          settings: zone.settings,
          metadata: zone.metadata
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const zone = await Zone.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      data: {
        user,
        zone: zone || null
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};