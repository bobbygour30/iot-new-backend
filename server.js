// Load environment variables FIRST - before any other code
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env file from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Verify environment variables are loaded
console.log('Environment check:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Now import the app
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});