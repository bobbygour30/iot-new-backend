// src/config/database.js
const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
    this.isConnecting = false;
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
      await new Promise(resolve => setTimeout(resolve, 1000));
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
        serverSelectionTimeoutMS: 10000, // Increased from 5000
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 1, // Reduced for serverless
        minPoolSize: 0,
        heartbeatFrequencyMS: 30000,
        retryWrites: true,
        retryReads: true,
      };

      const conn = await mongoose.connect(MONGODB_URI, options);
      this.connection = conn;
      this.isConnecting = false;
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📦 Database: ${conn.connection.name}`);
      console.log(`🔗 Host: ${conn.connection.host}`);
      
      // Handle connection errors after initial connection
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error after connect:', err);
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