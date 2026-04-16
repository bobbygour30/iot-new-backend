const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const database = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Connect to database (this will use process.env.MONGODB_URI)
// Don't exit process on Vercel, just log the error
database.connect().catch(err => {
  console.error('Failed to connect to database:', err);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable for easier API access
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    'https://iot-seven-alpha.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - less strict on Vercel
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 100,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.path === '/health' // Skip rate limiting for health check
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// ==================== ROOT ROUTE ====================
// This fixes the "Route / not found" error on Vercel
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Zone Monitor API is running successfully!',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getMe: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout'
      },
      zones: {
        getZone: 'GET /api/zones',
        updateSettings: 'PUT /api/zones/settings',
        updateMetadata: 'PUT /api/zones/metadata'
      },
      health: 'GET /health',
      documentation: 'https://github.com/your-repo' // Add your docs link
    },
    timestamp: new Date().toISOString(),
    status: 'online'
  });
});

// ==================== API ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/zones', zoneRoutes);

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: database.connection ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
    version: process.version
  });
});

// ==================== API INFO ====================
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Zone Monitor API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      zones: '/api/zones',
      health: '/health'
    }
  });
});

// ==================== 404 HANDLER ====================
// This handles any routes that don't match above
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      '/',
      '/health',
      '/api',
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/me',
      '/api/zones'
    ]
  });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================
app.use(errorHandler);

module.exports = app;