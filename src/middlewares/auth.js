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

/**
 * Middleware to check if user is Admin (Pages 5, 6, and 9 requirement)
 * Must be used after authenticateToken
 * Returns 403 Forbidden if user is not an Admin
 * 
 * This middleware provides admin role protection for endpoints that should
 * only be accessible to users with admin privileges as specified in:
 * - Page 5: Product management operations
 * - Page 6: Product modification and deletion
 * - Page 9: Administrative functions
 */
const isAdmin = asyncErrorHandler((req, res, next) => {
  // Ensure user is authenticated first
  if (!req.user) {
    throw new AuthenticationError('Authentication required to access this resource');
  }

  // Check if user has admin role
  if (!req.user.role || req.user.role !== 'admin') {
    throw new AuthorizationError('Admin privileges required. This resource is restricted to administrators only.');
  }

  // User is authenticated and has admin role, proceed
  next();
});

module.exports = {
  authenticateToken,
  requireAdmin,
  isAdmin
};