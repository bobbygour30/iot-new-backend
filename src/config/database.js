const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
    this.isConnecting = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.connectionPromise = null;
  }

  async connect() {
    // If already connected, return
    if (this.connection && this.connection.readyState === 1) {
      console.log('Using existing database connection');
      return this.connection;
    }

    // If connection is in progress, return the existing promise
    if (this.connectionPromise) {
      console.log('Database connection in progress, waiting...');
      return this.connectionPromise;
    }

    this.connectionPromise = this._connect();
    return this.connectionPromise;
  }

  async _connect() {
    this.isConnecting = true;

    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      
      console.log('Attempting to connect to MongoDB...');
      console.log('MONGODB_URI exists:', !!MONGODB_URI);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('VERCEL env:', process.env.VERCEL);
      
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables.');
      }

      // Check if we're in a serverless environment (Vercel)
      const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
      
      // Optimized options for serverless environment
      const options = {
        serverSelectionTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 60000, // 60 seconds
        connectTimeoutMS: 30000, // 30 seconds
        maxPoolSize: isServerless ? 1 : 10,
        minPoolSize: 0,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        retryReads: true,
        // For serverless, we need to ensure connections are cleaned up
        ...(isServerless && { 
          maxIdleTimeMS: 10000,
          waitQueueTimeoutMS: 10000 
        })
      };

      console.log('Connection options:', { 
        serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
        maxPoolSize: options.maxPoolSize,
        isServerless 
      });

      const conn = await mongoose.connect(MONGODB_URI, options);
      this.connection = conn;
      this.isConnecting = false;
      this.retryCount = 0;
      this.connectionPromise = null;
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📦 Database: ${conn.connection.name}`);
      console.log(`🔗 Host: ${conn.connection.host}`);
      console.log(`📊 Connection state: ${conn.connection.readyState}`);
      
      // Handle connection errors after initial connection
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error after connect:', err.message);
        this.connection = null;
        this.connectionPromise = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.connection = null;
        this.connectionPromise = null;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        this.connection = mongoose.connection;
      });
      
      return conn;
    } catch (error) {
      this.isConnecting = false;
      this.connectionPromise = null;
      console.error('❌ MongoDB connection error:', error.message);
      
      // Check for specific error types
      if (error.message.includes('not whitelisted') || error.message.includes('IP address')) {
        console.error('\n🔴 IP WHITELIST ISSUE DETECTED!');
        console.error('Please add Vercel IP addresses to MongoDB Atlas:');
        console.error('1. Go to MongoDB Atlas → Network Access');
        console.error('2. Click "Add IP Address"');
        console.error('3. Add 0.0.0.0/0 for testing (or Vercel IP range: 76.76.21.0/24)');
        console.error('4. Click Confirm\n');
      }
      
      if (error.message.includes('authentication failed')) {
        console.error('\n🔴 AUTHENTICATION FAILED!');
        console.error('Please check your MongoDB username and password in MONGODB_URI\n');
      }
      
      if (error.message.includes('timed out')) {
        console.error('\n🔴 CONNECTION TIMEOUT!');
        console.error('Possible causes:');
        console.error('1. Network issues between Vercel and MongoDB Atlas');
        console.error('2. MongoDB Atlas firewall blocking Vercel IPs');
        console.error('3. Incorrect MongoDB URI format');
        console.error('4. MongoDB Atlas cluster is paused or unavailable\n');
      }
      
      // Don't throw, return null to let the app handle it
      return null;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      this.connectionPromise = null;
      console.log('Database disconnected');
    }
  }

  // Helper to check if connected
  isConnected() {
    return this.connection && this.connection.readyState === 1;
  }
  
  // Get connection status
  getStatus() {
    if (!this.connection) return 'disconnected';
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[this.connection.readyState] || 'unknown';
  }
}

module.exports = new Database();