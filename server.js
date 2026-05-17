const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=' .repeat(50));
console.log('🚀 Zone Monitor API Starting...');
console.log('=' .repeat(50));
console.log('Environment check:');
console.log(`📦 PORT: ${process.env.PORT || 5000}`);
console.log(`🗄️  MONGODB_URI exists: ${!!process.env.MONGODB_URI}`);
console.log(`🔑 JWT_SECRET exists: ${!!process.env.JWT_SECRET}`);
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`☁️  VERCEL: ${process.env.VERCEL === '1' ? 'Yes' : 'No'}`);
console.log('=' .repeat(50));

const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Only listen when not in Vercel serverless environment
const isServerless = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

if (!isServerless && !isProduction) {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    console.log('=' .repeat(50));
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
} else {
  console.log('📡 Running in serverless mode (Vercel)');
  console.log('💡 Server will handle requests via serverless functions');
  console.log('=' .repeat(50));
}

// Export for Vercel
module.exports = app;