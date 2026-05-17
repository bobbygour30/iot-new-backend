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
      
      console.log('=' .repeat(50));
      console.log('🔌 Attempting to connect to MongoDB...');
      console.log('=' .repeat(50));
      console.log(`📝 MONGODB_URI exists: ${!!MONGODB_URI}`);
      
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables.');
      }

      // Log URI prefix for debugging (without exposing credentials)
      const uriParts = MONGODB_URI.split('@');
      console.log(`🔗 Connection string format: ${uriParts[0].substring(0, 30)}...@${uriParts[1]?.substring(0, 20)}...`);
      
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
        dbName: 'test', // Explicitly set database name
        ...(isServerless && { 
          maxIdleTimeMS: 10000,
          waitQueueTimeoutMS: 10000 
        })
      };

      console.log(`🖥️  Environment: ${isServerless ? 'Serverless (Vercel)' : 'Development'}`);
      console.log(`⚙️  Options: serverSelectionTimeoutMS=${options.serverSelectionTimeoutMS}, maxPoolSize=${options.maxPoolSize}`);

      const conn = await mongoose.connect(MONGODB_URI, options);
      this.connection = conn;
      this.isConnecting = false;
      this.retryCount = 0;
      this.connectionPromise = null;
      
      console.log('=' .repeat(50));
      console.log('✅ MongoDB connected successfully!');
      console.log(`📦 Database: ${conn.connection.name}`);
      console.log(`🔗 Host: ${conn.connection.host}`);
      console.log(`📊 Connection state: ${conn.connection.readyState === 1 ? 'Connected' : 'Other'}`);
      console.log('=' .repeat(50));
      
      // Handle connection errors after initial connection
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error after connect:', err.message);
        this.connection = null;
        this.connectionPromise = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.connection = null;
        this.connectionPromise = null;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        this.connection = mongoose.connection;
      });
      
      return conn;
    } catch (error) {
      this.isConnecting = false;
      this.connectionPromise = null;
      console.error('=' .repeat(50));
      console.error('❌ MongoDB connection error:', error.message);
      console.error('=' .repeat(50));
      
      // Check for specific error types
      if (error.message.includes('not whitelisted') || error.message.includes('IP address')) {
        console.error('\n🔴 IP WHITELIST ISSUE DETECTED!');
        console.error('Please add your IP address to MongoDB Atlas:');
        console.error('1. Go to MongoDB Atlas → Network Access');
        console.error('2. Click "Add IP Address"');
        console.error('3. Add your current IP address');
        console.error('4. Or add 0.0.0.0/0 for testing (not recommended for production)');
        console.error('5. Click Confirm\n');
      }
      
      if (error.message.includes('authentication failed')) {
        console.error('\n🔴 AUTHENTICATION FAILED!');
        console.error('Please check your MongoDB username and password in MONGODB_URI');
        console.error(`Username: fstindiaiot_db_user`);
        console.error('Make sure password is correct and special characters are URL encoded\n');
      }
      
      if (error.message.includes('timed out')) {
        console.error('\n🔴 CONNECTION TIMEOUT!');
        console.error('Possible causes:');
        console.error('1. Network issues between your machine and MongoDB Atlas');
        console.error('2. MongoDB Atlas firewall blocking your IP');
        console.error('3. Incorrect MongoDB URI format');
        console.error('4. MongoDB Atlas cluster is paused or unavailable\n');
      }
      
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n🔴 CONNECTION REFUSED!');
        console.error('MongoDB Atlas cluster might be unavailable or paused.');
        console.error('Check your MongoDB Atlas cluster status.\n');
      }
      
      console.error('📝 Full error details:', error);
      
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