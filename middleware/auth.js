/**
 * Authentication middleware for the Psychology Clinic API
 * Provides authentication and authorization utilities
 */

// Attach user to response locals if authenticated
const attachUser = (req, res, next) => {
  res.locals.user = req.user || null;
  next();
};

// Require authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({
    error: 'Authentication required',
    message: 'Please log in to access this resource',
    loginUrl: '/auth/github',
    documentation: '/api-docs'
  });
};

// Require specific roles middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Required roles: ${roles.join(', ')}`,
        yourRole: req.user.role,
        availableRoles: ['patient', 'psychologist', 'admin']
      });
    }
    
    next();
  };
};

// Optional authentication (attach user if available)
const optionalAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
};

// Check if user owns the resource or has admin role
const isOwnerOrAdmin = (resourceOwnerIdPath = 'params.id') => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }
    
    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Get resource owner ID from the specified path
    const resourceOwnerId = getNestedValue(req, resourceOwnerIdPath);
    
    // User can access their own resources
    if (req.user._id.toString() === resourceOwnerId) {
      return next();
    }
    
    // Psychologists can access patient resources they're assigned to
    if (req.user.role === 'psychologist') {
      // Additional logic can be added here for psychologist-patient relationships
      return next();
    }
    
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only access your own resources'
    });
  };
};

// Helper function to get nested object values
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current ? current[key] : undefined;
  }, obj);
}

// API key authentication (for external services)
const requireApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'A valid API key is required to access this endpoint'
    });
  }
  
  next();
};

module.exports = {
  attachUser,
  isAuthenticated,
  requireRole,
  optionalAuth,
  isOwnerOrAdmin,
  requireApiKey
};