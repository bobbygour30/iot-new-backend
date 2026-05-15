// src/models/Zone.js
const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Zone name is required'],
    trim: true
  },
  area: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    trim: true
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
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
  }
}, {
  timestamps: true
});

// Compound index for unique zone per plant
zoneSchema.index({ name: 1, plantId: 1 }, { unique: true });

const Zone = mongoose.models.Zone || mongoose.model('Zone', zoneSchema);
module.exports = Zone;