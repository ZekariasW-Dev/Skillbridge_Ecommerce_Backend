const rateLimit = require('express-rate-limit');
const { createResponse } = require('../utils/responses');

/**
 * General API rate limiter
 * Applies to all endpoints
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: (req, res) => {
    return createResponse(
      false,
      'Too many requests',
      null,
      ['Too many requests from this IP, please try again later']
    );
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Authentication rate limiter
 * Stricter limits for login/register endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 auth requests per windowMs
  message: (req, res) => {
    return createResponse(
      false,
      'Too many authentication attempts',
      null,
      ['Too many login/register attempts from this IP, please try again later']
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: false, // Count failed requests
});

/**
 * Order placement rate limiter
 * Moderate limits for order creation
 */
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 order attempts per minute
  message: (req, res) => {
    return createResponse(
      false,
      'Too many order attempts',
      null,
      ['Too many order placement attempts, please wait before trying again']
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin operations rate limiter
 * Moderate limits for admin actions
 */
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 admin operations per 5 minutes
  message: (req, res) => {
    return createResponse(
      false,
      'Too many admin operations',
      null,
      ['Too many admin operations from this IP, please try again later']
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Search rate limiter
 * Higher limits for search operations
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 200 search requests per minute
  message: (req, res) => {
    return createResponse(
      false,
      'Too many search requests',
      null,
      ['Too many search requests, please slow down']
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting if no search parameter (regular product listing)
    return !req.query.search || req.query.search.trim().length === 0;
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  orderLimiter,
  adminLimiter,
  searchLimiter
};