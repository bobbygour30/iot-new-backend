// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CompanyZone = require('../models/CompanyZone');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register new zone user
// @route   POST /api/auth/register
// @access  Public
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

    console.log('Registration data received:', { firstName, lastName, email, companyName, zoneName });

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
      phone,
      role: 'user' // Default role for new registrations
    });

    console.log('User created:', user._id);

    // Create company zone for user
    const zone = await CompanyZone.create({
      zoneName,
      companyName,
      address,
      state,
      city,
      pinCode,
      userId: user._id
    });

    console.log('Zone created:', zone._id);

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

    let zone = null;

    // For super admin, skip zone validation
    if (user.role === 'super_admin') {
      console.log('Super admin login - skipping zone validation');
      // Super admin doesn't need a zone
      zone = null;
    } else {
      // Check if zone exists for regular user
      zone = await CompanyZone.findOne({ 
        userId: user._id,
        zoneName: zoneName 
      });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: `Zone '${zoneName}' not found for this user`
        });
      }
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
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          lastLogin: user.lastLogin
        },
        zone: zone ? {
          id: zone._id,
          zoneName: zone.zoneName,
          companyName: zone.companyName,
          address: zone.address,
          state: zone.state,
          city: zone.city,
          pinCode: zone.pinCode,
          settings: zone.settings,
          metadata: zone.metadata
        } : null
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
    
    let zone = null;
    // Only fetch zone for non-super admins
    if (user.role !== 'super_admin') {
      zone = await CompanyZone.findOne({ userId: user._id });
    }

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

// @desc    Create super admin (one-time setup)
// @route   POST /api/auth/create-super-admin
// @access  Public (should be disabled after first use)
const createSuperAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Super admin already exists'
      });
    }

    // Create super admin
    const superAdmin = await User.create({
      firstName: firstName || 'Super',
      lastName: lastName || 'Admin',
      email: email || 'superadmin@zonemonitor.com',
      password: password || 'Admin@123',
      phone: phone || '9999999999',
      role: 'super_admin',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      data: {
        id: superAdmin._id,
        email: superAdmin.email,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        role: superAdmin.role
      }
    });
  } catch (error) {
    console.error('Create super admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  createSuperAdmin
};