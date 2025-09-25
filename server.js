// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const { attachUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment verification
console.log('🚀 Starting Psychology Clinic API Server...');
console.log('=== Environment Configuration ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? '✅ Configured' : '❌ Missing');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configured' : '❌ Missing');
console.log('=================================');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/psychology_clinic')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Session configuration with enhanced security
app.use(session({
  name: 'psychology_clinic.sid',
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  // In production, consider using MongoDB store or Redis
  // store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// Passport middleware (authentication)
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://cse341-clinic.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
app.use(attachUser);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Psychology Clinic API Documentation'
}));

app.use('/auth', require('./routes/auth'));
app.use('/patients', require('./routes/patients'));
app.use('/appointments', require('./routes/appointments'));

// Health check endpoint with detailed information
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    authentication: req.isAuthenticated() ? 'Authenticated' : 'Not Authenticated',
    endpoints: {
      documentation: '/api-docs',
      authentication: '/auth/github',
      patients: '/patients',
      appointments: '/appointments'
    }
  };
  
  res.status(200).json(healthCheck);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Psychology Clinic Appointment System API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    authentication: {
      login: '/auth/github',
      status: '/auth/status',
      logout: '/auth/logout'
    },
    resources: {
      patients: '/patients',
      appointments: '/appointments'
    },
    user: req.isAuthenticated() ? req.user.getPublicProfile() : null
  });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: {
      documentation: '/api-docs',
      authentication: '/auth',
      patients: '/patients',
      appointments: '/appointments'
    }
  });
});

// General 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested resource was not found',
    suggestedAction: 'Visit /api-docs for API documentation'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔐 Authentication: http://localhost:${PORT}/auth/github`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    console.log('Process terminated');
  });
});

module.exports = app;