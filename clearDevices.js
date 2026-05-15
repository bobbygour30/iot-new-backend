// scripts/clearDevices.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import your Device model (adjust the path as needed)
const Device = require('./src/models/Device');

const clearDevices = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name');
    console.log('✅ Connected to MongoDB');

    // Delete all devices
    const result = await Device.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} devices`);

    // Optional: Also reset any sequences if you have auto-increment
    console.log('✅ All devices have been cleared');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing devices:', error);
    process.exit(1);
  }
};

// Run the function
clearDevices();