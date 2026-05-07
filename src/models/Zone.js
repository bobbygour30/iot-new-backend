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

// Only keep this index - remove any other indexes
zoneSchema.index({ name: 1, plantId: 1 }, { unique: true });

// Drop the old index if it exists (run this once in MongoDB)
// db.zones.dropIndex("zoneName_1_userId_1");

const Zone = mongoose.models.Zone || mongoose.model('Zone', zoneSchema);
module.exports = Zone;