// src/models/CompanyZone.js
const mongoose = require('mongoose');

const companyZoneSchema = new mongoose.Schema({
  zoneName: {
    type: String,
    required: [true, 'Zone name is required'],
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  pinCode: {
    type: String,
    required: [true, 'PIN code is required'],
    match: [/^\d{6}$/, 'PIN code must be 6 digits']
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
  settings: {
    temperatureThreshold: {
      type: Number,
      default: 34
    },
    humidityThreshold: {
      type: Number,
      default: 70
    },
    vocThreshold: {
      type: Number,
      default: 35000
    },
    alertEnabled: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    deviceCount: {
      type: Number,
      default: 0
    },
    totalReadings: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Compound index for unique zone per user
companyZoneSchema.index({ zoneName: 1, userId: 1 }, { unique: true });

const CompanyZone = mongoose.models.CompanyZone || mongoose.model('CompanyZone', companyZoneSchema);
module.exports = CompanyZone;