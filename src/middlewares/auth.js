const jwt = require('jsonwebtoken');
const { createResponse } = require('../utils/responses');

/**
 * Middleware to authenticate JWT token
 * Returns 401 Unauthorized if no token or invalid token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json(createResponse(
      false, 
      'Access denied', 
      null, 
      ['Authentication token is required']
    ));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json(createResponse(
        false, 
        'Access denied', 
        null, 
        ['Invalid or expired authentication token']
      ));
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware to require Admin role
 * Must be used after authenticateToken
 * Returns 403 Forbidden if user is not an Admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(createResponse(
      false, 
      'Access denied', 
      null, 
      ['Authentication required']
    ));
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json(createResponse(
      false, 
      'Access forbidden', 
      null, 
      ['Admin role required to access this resource']
    ));
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};