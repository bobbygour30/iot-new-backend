// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const database = require('./config/database');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Enable trust proxy for Vercel
app.set('trust proxy', 1);

// Connect to database
database.connect().catch(err => {
  console.error('Failed to connect to database:', err);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    'https://iot-seven-alpha.vercel.app',
    'https://sensor-six-iota.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Fixed Rate limiting - removed invalid validate options
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 100,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.path === '/health',
  // Only use valid validate options
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
    limit: false
    // Removed 'forwardedHeader' as it doesn't exist in this version
  },
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
    return ip || 'unknown';
  }
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - IP: ${req.ip} - ${new Date().toISOString()}`);
    next();
  });
}

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Zone Monitor API is running successfully!',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    status: 'online'
  });
});

// ==================== API ROUTES ====================
app.use('/api', apiRoutes);

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: database.connection ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
    clientIp: req.ip
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================
app.use(errorHandler);

module.exports = app;