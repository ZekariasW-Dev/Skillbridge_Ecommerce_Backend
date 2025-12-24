const jwt = require('jsonwebtoken');
const { createResponse } = require('../utils/responses');
const { 
  AuthenticationError, 
  AuthorizationError,
  asyncErrorHandler 
} = require('./errorHandler');

/**
 * Middleware to authenticate JWT token
 * Returns 401 Unauthorized if no token or invalid token
 */
const authenticateToken = asyncErrorHandler((req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw new AuthenticationError('Authentication token is required');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      throw new AuthenticationError('Invalid or expired authentication token');
    }
    req.user = user;
    next();
  });
});

/**
 * Middleware to require Admin role
 * Must be used after authenticateToken
 * Returns 403 Forbidden if user is not an Admin
 */
const requireAdmin = asyncErrorHandler((req, res, next) => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Admin role required to access this resource');
  }

  next();
});

module.exports = {
  authenticateToken,
  requireAdmin
};