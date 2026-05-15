// src/models/Device.js
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
    enum: ['Temperature Sensor', 'Humidity Sensor', 'VOC Sensor', 'Multi-Sensor'],
    default: 'Multi-Sensor'
  },
  model: {
    type: String,
    default: '',
    trim: true
  },
  location: {
    type: String,
    default: '',
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
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance'],
    default: 'offline'
  },
  lastReading: {
    temperature: {
      type: Number,
      default: 0
    },
    humidity: {
      type: Number,
      default: 0
    },
    voc: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ plantId: 1, zoneId: 1 });
deviceSchema.index({ status: 1 });
deviceSchema.index({ userId: 1 });

const Device = mongoose.models.Device || mongoose.model('Device', deviceSchema);
module.exports = Device;