const jwt = require('jsonwebtoken');
const { createResponse } = require('../utils/responses');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(createResponse(false, 'Access token required', null, ['No token provided']));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json(createResponse(false, 'Invalid or expired token', null, ['Token verification failed']));
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json(createResponse(false, 'Admin access required', null, ['Insufficient permissions']));
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};