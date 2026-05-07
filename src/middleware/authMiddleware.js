// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login first.'
      });
    }

    console.log('🔑 Token received:', token.substring(0, 50) + '...');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    
    // Get user from database (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found for token');
      return res.status(401).json({
        success: false,
        message: 'User not found. Invalid token.'
      });
    }

    if (!user.isActive) {
      console.log('❌ User account is deactivated');
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    console.log('✅ User authenticated:', user.email, 'Role:', user.role);

    // Attach user to request with both _id and id for compatibility
    req.user = {
      _id: user._id,
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      companyName: user.companyName,
      isActive: user.isActive
    };
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔒 Authorization check - User role:', req.user?.role, 'Required roles:', roles);
    
    if (!req.user) {
      console.log('❌ User not authenticated');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`❌ Role ${req.user.role} not authorized. Required: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this resource`
      });
    }
    
    console.log('✅ Authorization successful');
    next();
  };
};

module.exports = { authMiddleware, authorize };