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

// Index for faster queries
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ plantId: 1, zoneId: 1 });
deviceSchema.index({ status: 1 });
deviceSchema.index({ userId: 1 });

// Virtual for device age
deviceSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to update device status based on last reading
deviceSchema.methods.updateStatusFromReading = function() {
  if (!this.lastReading.timestamp) {
    this.status = 'offline';
  } else {
    const minutesSinceLastReading = (Date.now() - new Date(this.lastReading.timestamp)) / (1000 * 60);
    if (minutesSinceLastReading > 10) {
      this.status = 'offline';
    } else {
      this.status = 'online';
    }
  }
  return this.save();
};

// Static method to get device statistics
deviceSchema.statics.getStatistics = async function() {
  const total = await this.countDocuments();
  const online = await this.countDocuments({ status: 'online' });
  const offline = await this.countDocuments({ status: 'offline' });
  const maintenance = await this.countDocuments({ status: 'maintenance' });
  
  return { total, online, offline, maintenance };
};

const Device = mongoose.models.Device || mongoose.model('Device', deviceSchema);
module.exports = Device;