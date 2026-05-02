// scripts/fixSuperAdmin.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

const fixSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find super admin without companyName
    const superAdmin = await User.findOne({ email: 'superadmin@zonemonitor.com' });
    
    if (superAdmin) {
      if (!superAdmin.companyName) {
        superAdmin.companyName = 'Super Admin';
        await superAdmin.save();
        console.log('✅ Super admin company name added successfully!');
      } else {
        console.log('Super admin already has company name:', superAdmin.companyName);
      }
    } else {
      console.log('Super admin not found. Please run createSuperAdmin.js first.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

fixSuperAdmin();