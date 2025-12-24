const { createResponse } = require('../utils/responses');

/**
 * Global Error Handler Middleware
 * Centralized error handling for the entire application
 * Provides consistent error responses and logging
 */

/**
 * Custom Error Classes for better error categorization
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

/**
 * Error Handler Functions
 */

/**
 * Handle MongoDB/Database specific errors
 */
const handleDatabaseError = (error) => {
  let message = 'Database operation failed';
  let statusCode = 500;
  let errors = [];

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    message = 'Duplicate entry detected';
    errors = [`The ${field} is already in use`];
    statusCode = 409;
    return new ConflictError(message, errors);
  }

  // MongoDB validation error
  if (error.name === 'ValidationError') {
    message = 'Validation failed';
    errors = Object.values(error.errors).map(err => err.message);
    statusCode = 400;
    return new ValidationError(message, errors);
  }

  // MongoDB cast error (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    message = 'Invalid data format';
    errors = [`Invalid ${error.path}: ${error.value}`];
    statusCode = 400;
    return new ValidationError(message, errors);
  }

  // Connection errors
  if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
    message = 'Database connection failed';
    errors = ['Unable to connect to database'];
    return new DatabaseError(message);
  }

  return new DatabaseError(message);
};

/**
 * Handle JWT specific errors
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid authentication token');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Authentication token has expired');
  }
  
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('Authentication token not active');
  }
  
  return new AuthenticationError('Authentication failed');
};

/**
 * Handle validation errors from express-validator or custom validation
 */
const handleValidationError = (error) => {
  if (error.errors && Array.isArray(error.errors)) {
    return new ValidationError('Validation failed', error.errors);
  }
  
  return new ValidationError(error.message || 'Validation failed');
};

/**
 * Log error details for debugging and monitoring
 */
const logError = (error, req) => {
  const timestamp = new Date().toISOString();
  const method = req?.method || 'UNKNOWN';
  const url = req?.originalUrl || req?.url || 'UNKNOWN';
  const userAgent = req?.get('User-Agent') || 'UNKNOWN';
  const ip = req?.ip || req?.connection?.remoteAddress || 'UNKNOWN';
  
  console.error(`
🚨 ERROR OCCURRED - ${timestamp}
📍 Request: ${method} ${url}
🌐 IP: ${ip}
🖥️  User-Agent: ${userAgent}
❌ Error Name: ${error.name}
💬 Error Message: ${error.message}
📊 Status Code: ${error.statusCode || 500}
🔍 Stack Trace:
${error.stack}
${'='.repeat(80)}
  `);
};

/**
 * Send error response to client
 */
const sendErrorResponse = (error, res) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const errors = error.errors || [message];
  
  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  const responseMessage = isProduction && statusCode === 500 
    ? 'Internal server error' 
    : message;
  
  const responseErrors = isProduction && statusCode === 500 
    ? ['An unexpected error occurred'] 
    : errors;

  res.status(statusCode).json(createResponse(
    false,
    responseMessage,
    null,
    responseErrors
  ));
};

/**
 * Main Global Error Handler Middleware
 */
const globalErrorHandler = (error, req, res, next) => {
  // Log the error for debugging
  logError(error, req);
  
  let processedError = error;
  
  // Handle specific error types
  if (error.code === 11000 || error.name === 'ValidationError' || error.name === 'CastError' || 
      error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
    processedError = handleDatabaseError(error);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || 
             error.name === 'NotBeforeError') {
    processedError = handleJWTError(error);
  } else if (error.name === 'ValidationError' && error.errors) {
    processedError = handleValidationError(error);
  }
  
  // Ensure error has proper structure
  if (!processedError.statusCode) {
    processedError.statusCode = 500;
  }
  
  if (!processedError.isOperational) {
    processedError.isOperational = false;
  }
  
  // Send error response
  sendErrorResponse(processedError, res);
};

/**
 * Handle 404 Not Found errors for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Process exit handlers for uncaught exceptions and unhandled rejections
 */
const setupProcessHandlers = () => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('🚨 UNCAUGHT EXCEPTION! Shutting down...');
    console.error('Error:', error.name, error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 UNHANDLED REJECTION! Shutting down...');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    process.exit(1);
  });
  
  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
  });
  
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('👋 SIGINT received. Shutting down gracefully...');
    process.exit(0);
  });
};

module.exports = {
  // Error Classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  
  // Middleware Functions
  globalErrorHandler,
  notFoundHandler,
  asyncErrorHandler,
  
  // Setup Functions
  setupProcessHandlers,
  
  // Utility Functions
  logError,
  sendErrorResponse
};