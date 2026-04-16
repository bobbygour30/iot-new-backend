const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    if (this.connection) {
      console.log('Using existing database connection');
      return this.connection;
    }

    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      
      console.log('Attempting to connect to MongoDB...');
      console.log('MONGODB_URI exists:', !!MONGODB_URI);
      
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables. Please check your .env file.');
      }

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      const conn = await mongoose.connect(MONGODB_URI, options);
      this.connection = conn;
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📦 Database: ${conn.connection.name}`);
      console.log(`🔗 Host: ${conn.connection.host}`);
      
      return conn;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      if (error.message.includes('ENOTFOUND')) {
        console.error('Network error: Unable to reach MongoDB server. Check your internet connection.');
      } else if (error.message.includes('Authentication failed')) {
        console.error('Authentication failed: Check your username and password in MONGODB_URI');
      }
      throw error; // Don't exit process here, let the caller handle it
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      console.log('Database disconnected');
    }
  }
}

module.exports = new Database();