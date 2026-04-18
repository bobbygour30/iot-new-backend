const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: [true, 'Device ID is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Device type is required'],
    enum: ['Temperature Sensor', 'Humidity Sensor', 'VOC Sensor', 'Multi-Sensor'],
    default: 'Multi-Sensor'
  },
  model: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  thresholds: {
    temperature: {
      type: Number,
      default: 34
    },
    humidity: {
      type: Number,
      default: 70
    },
    voc: {
      type: Number,
      default: 35000
    }
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastReading: {
    temperature: Number,
    humidity: Number,
    voc: Number,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ plantId: 1, zoneId: 1 });

module.exports = mongoose.model('Device', deviceSchema);