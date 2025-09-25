/**
 * Global error handling middleware
 * Handles various types of errors and returns appropriate responses
 */

// MongoDB duplicate key error
const handleDuplicateKeyError = (err, res) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `A record with that ${field} (${value}) already exists.`;
  
  return res.status(409).json({
    error: 'Duplicate key error',
    message: message,
    field: field,
    value: value
  });
};

// MongoDB validation error
const handleValidationError = (err, res) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  
  return res.status(400).json({
    error: 'Validation error',
    message: message,
    details: errors
  });
};

// MongoDB CastError (invalid ObjectId)
const handleCastError = (err, res) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  
  return res.status(400).json({
    error: 'Invalid ID format',
    message: message,
    path: err.path,
    value: err.value
  });
};

// JWT errors
const handleJWTError = (res) => {
  return res.status(401).json({
    error: 'Invalid token',
    message: 'Please log in again'
  });
};

const handleJWTExpiredError = (res) => {
  return res.status(401).json({
    error: 'Token expired',
    message: 'Please log in again'
  });
};

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  let error = { ...err };
  error.message = err.message;

  // MongoDB errors
  if (err.name === 'CastError') {
    return handleCastError(err, res);
  }
  
  if (err.code === 11000) {
    return handleDuplicateKeyError(err, res);
  }
  
  if (err.name === 'ValidationError') {
    return handleValidationError(err, res);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return handleJWTError(res);
  }
  
  if (err.name === 'TokenExpiredError') {
    return handleJWTExpiredError(res);
  }
  
  // Passport authentication errors
  if (err.name === 'AuthenticationError') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message
    });
  }
  
  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Server Error' : 'Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;