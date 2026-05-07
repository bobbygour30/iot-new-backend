// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const database = require('./config/database');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

app.set('trust proxy', 1);

// Database connection (don't exit on error in production)
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

// CORS configuration - FIXED
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://iot-seven-alpha.vercel.app',
  'https://iot-new-backend.vercel.app',
  'https://sensor-six-iota.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 100,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.path === '/health',
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
    limit: false
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

// Request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - IP: ${req.ip} - ${new Date().toISOString()}`);
    next();
  });
}

// Root route
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

// API routes
app.use('/api', apiRoutes);

// Health check
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;