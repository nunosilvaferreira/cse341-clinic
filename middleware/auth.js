/**
 * Authentication middleware for the Psychology Clinic API
 */

// Attach user to request if authenticated
const attachUser = (req, res, next) => {
  res.locals.user = req.user || null;
  next();
};

// Require authentication middleware
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({
    error: 'Authentication required',
    message: 'Please log in to access this resource',
    loginUrl: '/auth/github'
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
        yourRole: req.user.role
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

module.exports = {
  attachUser,
  requireAuth,
  requireRole,
  optionalAuth
};