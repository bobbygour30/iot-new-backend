const mongoose = require('mongoose');

let connection = null;
let connectionStatus = 'disconnected';

const connectDB = async () => {
  try {
    if (connection && mongoose.connection.readyState === 1) {
      console.log('Using existing MongoDB connection');
      return connection;
    }

    console.log('Creating new MongoDB connection...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    connection = conn;
    connectionStatus = 'connected';
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    connectionStatus = 'disconnected';
    throw error;
  }
};

const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

const getStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = {
  connect: connectDB,
  isConnected,
  getStatus,
  connection: () => connection
};