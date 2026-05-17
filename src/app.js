const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

app.set('trust proxy', 1);

// Initialize db connection (don't block server start)
db.connect().catch(err => {
  console.error('Failed to connect to db:', err);
  // Don't exit process in serverless environment
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    process.exit(1);
  }
});

// Helmet security
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
    'https://iot-new-backend.vercel.app',
    'https://sensor-six-iota.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 100,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.path === '/health' || req.path === '/api/health',
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

// Request logging for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - IP: ${req.ip} - ${new Date().toISOString()}`);
    next();
  });
}

// Middleware to ensure db connection for API routes
const ensureDbConnection = async (req, res, next) => {
  // Skip db check for health endpoints
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  
  try {
    // If not connected, try to connect
    if (!db.isConnected()) {
      console.log('db not connected, attempting connection...');
      await db.connect();
    }
    
    // If still not connected, return error
    if (!db.isConnected()) {
      console.error('db connection failed for request:', req.method, req.path);
      return res.status(503).json({
        success: false,
        message: 'db connection issue. Please try again later.'
      });
    }
    
    next();
  } catch (error) {
    console.error('db connection middleware error:', error);
    res.status(503).json({
      success: false,
      message: 'db connection issue. Please try again.'
    });
  }
};

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Zone Monitor API is running successfully!',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    status: 'online',
    db: {
      connected: db.isConnected(),
      status: db.getStatus()
    }
  });
});

// Health check endpoint (no db connection required)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: db.isConnected() ? 'connected' : 'disconnected',
    mongodbStatus: db.getStatus(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    clientIp: req.ip
  });
});

// API routes with db connection middleware
app.use('/api', ensureDbConnection, apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;