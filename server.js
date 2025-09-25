const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const { attachUser } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
app.use(express.json());
app.use(attachUser);

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/auth', require('./routes/auth'));
app.use('/patients', require('./routes/patients'));
app.use('/appointments', require('./routes/appointments'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Psychology Clinic API is running!',
    timestamp: new Date().toISOString(),
    authentication: {
      login: '/auth/github',
      status: '/auth/status',
      docs: '/api-docs'
    }
  });
});

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Psychology Clinic Appointment System API',
    version: '1.0.0',
    endpoints: {
      documentation: '/api-docs',
      authentication: '/auth/github',
      health: '/health',
      patients: '/patients',
      appointments: '/appointments'
    }
  });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔐 Authentication: http://localhost:${PORT}/auth/github`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;