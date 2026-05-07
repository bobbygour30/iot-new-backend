// src/config/database.js
const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
    this.isConnecting = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async connect() {
    // If already connected, return
    if (this.connection && this.connection.readyState === 1) {
      console.log('Using existing database connection');
      return this.connection;
    }

    // If currently connecting, wait for it
    if (this.isConnecting) {
      console.log('Database connection in progress, waiting...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return this.connect();
    }

    this.isConnecting = true;

    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      
      console.log('Attempting to connect to MongoDB...');
      console.log('MONGODB_URI exists:', !!MONGODB_URI);
      
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables.');
      }

      // Optimized options for serverless environment
      const options = {
        serverSelectionTimeoutMS: 15000, // Increased timeout
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000,
        maxPoolSize: 1,
        minPoolSize: 0,
        heartbeatFrequencyMS: 30000,
        retryWrites: true,
        retryReads: true,
      };

      const conn = await mongoose.connect(MONGODB_URI, options);
      this.connection = conn;
      this.isConnecting = false;
      this.retryCount = 0;
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📦 Database: ${conn.connection.name}`);
      console.log(`🔗 Host: ${conn.connection.host}`);
      
      // Handle connection errors after initial connection
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error after connect:', err.message);
        this.connection = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.connection = null;
      });
      
      return conn;
    } catch (error) {
      this.isConnecting = false;
      console.error('❌ MongoDB connection error:', error.message);
      
      // Check if it's an IP whitelist issue
      if (error.message.includes('not whitelisted') || error.message.includes('IP address')) {
        console.error('\n🔴 IP WHITELIST ISSUE DETECTED!');
        console.error('Please add your Vercel IP addresses to MongoDB Atlas:');
        console.error('1. Go to MongoDB Atlas → Network Access');
        console.error('2. Click "Add IP Address"');
        console.error('3. Add Vercel IP range: 76.76.21.0/24');
        console.error('4. Or add 0.0.0.0/0 for testing (not recommended for production)');
        console.error('5. Click Confirm\n');
      }
      
      // Don't throw in production, just log and return null
      // This allows the app to start even if DB connection fails
      console.error('Continuing without database connection...');
      return null;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      console.log('Database disconnected');
    }
  }

  // Helper to check if connected
  isConnected() {
    return this.connection && this.connection.readyState === 1;
  }
}

module.exports = new Database();