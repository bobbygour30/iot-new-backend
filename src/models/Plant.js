// src/models/Plant.js
const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plant name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Plant type is required'],
    enum: ['Manufacturing', 'Processing', 'Assembly', 'Warehouse', 'R&D'],
    default: 'Manufacturing'
  },
  location: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
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

plantSchema.index({ name: 1, userId: 1 }, { unique: true });

const Plant = mongoose.models.Plant || mongoose.model('Plant', plantSchema);
module.exports = Plant;