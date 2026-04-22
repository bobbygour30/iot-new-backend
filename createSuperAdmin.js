// scripts/createSuperAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import your actual User model to ensure consistency
const User = require('./src/models/User');

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: 'superadmin@zonemonitor.com' });
    
    if (existingAdmin) {
      console.log('⚠️ Super admin already exists!');
      console.log('Email: superadmin@zonemonitor.com');
      console.log('You can login with your existing password');
      process.exit(0);
    }

    // Create super admin (password will be automatically hashed by the User model's pre-save hook)
    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@zonemonitor.com',
      password: 'Admin@123', // Will be auto-hashed by the model
      phone: '9999999999',
      role: 'super_admin',
      isActive: true
    });

    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email: superadmin@zonemonitor.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role: super_admin');
    console.log('🆔 User ID:', superAdmin._id);

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    if (error.code === 11000) {
      console.log('Duplicate key error. User might already exist with this email.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
    process.exit(0);
  }
};

createSuperAdmin();