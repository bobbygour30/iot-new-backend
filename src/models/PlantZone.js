// src/models/PlantZone.js
const mongoose = require('mongoose');

const plantZoneSchema = new mongoose.Schema({
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

plantZoneSchema.index({ name: 1, plantId: 1 }, { unique: true });

const PlantZone = mongoose.models.PlantZone || mongoose.model('PlantZone', plantZoneSchema);
module.exports = PlantZone;