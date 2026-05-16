const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  companyName: {
    type: String,
    required: function() {
      return this.role !== 'super_admin';
    },
    trim: true,
    default: null
  },
  // New location fields
  address: {
    type: String,
    required: function() {
      return this.role !== 'super_admin';
    },
    trim: true,
    default: ''
  },
  state: {
    type: String,
    required: function() {
      return this.role !== 'super_admin';
    },
    trim: true,
    default: ''
  },
  city: {
    type: String,
    required: function() {
      return this.role !== 'super_admin';
    },
    trim: true,
    default: ''
  },
  pinCode: {
    type: String,
    required: function() {
      return this.role !== 'super_admin';
    },
    trim: true,
    match: [/^\d{6}$/, 'PIN code must be 6 digits'],
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'zone_admin', 'admin', 'super_admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Ensure indexes are created
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ state: 1 });
userSchema.index({ city: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;