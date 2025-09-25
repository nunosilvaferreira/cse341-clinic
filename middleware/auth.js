// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ 
    message: 'Unauthorized: Please log in to access this resource',
    loginUrl: '/auth/github' 
  });
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin()) {
    return next();
  }
  res.status(403).json({ 
    message: 'Forbidden: Admin access required' 
  });
};

// Middleware to attach user info to response
const attachUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  attachUser
};