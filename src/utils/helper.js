/**
 * Helper utility functions for the E-commerce API
 */

/**
 * Sanitize user object by removing sensitive fields
 * @param {Object} user - User object
 * @returns {Object} - Sanitized user object without password
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

/**
 * Calculate pagination metadata
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} totalItems - Total number of items
 * @returns {Object} - Pagination metadata
 */
const getPaginationMetadata = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    currentPage: page,
    pageSize: limit,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage
  };
};

/**
 * Format price to 2 decimal places
 * @param {Number} price - Price value
 * @returns {Number} - Formatted price
 */
const formatPrice = (price) => {
  return Math.round(price * 100) / 100;
};

/**
 * Calculate total price for order items
 * @param {Array} items - Array of items with price and quantity
 * @returns {Number} - Total price
 */
const calculateTotalPrice = (items) => {
  const total = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  return formatPrice(total);
};

/**
 * Validate UUID format
 * @param {String} id - UUID string
 * @returns {Boolean} - True if valid UUID
 */
const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Generate order description from items
 * @param {Array} items - Array of order items
 * @returns {String} - Order description
 */
const generateOrderDescription = (items) => {
  const itemCount = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return `Order with ${itemCount} product${itemCount > 1 ? 's' : ''} (${totalQuantity} item${totalQuantity > 1 ? 's' : ''} total)`;
};

/**
 * Check if string is empty or whitespace only
 * @param {String} str - String to check
 * @returns {Boolean} - True if empty or whitespace
 */
const isEmptyString = (str) => {
  return !str || str.trim().length === 0;
};

/**
 * Capitalize first letter of string
 * @param {String} str - String to capitalize
 * @returns {String} - Capitalized string
 */
const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format date to ISO string
 * @param {Date} date - Date object
 * @returns {String} - ISO formatted date string
 */
const formatDate = (date) => {
  return date ? new Date(date).toISOString() : null;
};

/**
 * Check if value is a positive number
 * @param {*} value - Value to check
 * @returns {Boolean} - True if positive number
 */
const isPositiveNumber = (value) => {
  return typeof value === 'number' && value > 0 && !isNaN(value);
};

/**
 * Check if value is a non-negative integer
 * @param {*} value - Value to check
 * @returns {Boolean} - True if non-negative integer
 */
const isNonNegativeInteger = (value) => {
  return Number.isInteger(value) && value >= 0;
};

/**
 * Sanitize product object for response
 * @param {Object} product - Product object
 * @returns {Object} - Sanitized product object
 */
const sanitizeProduct = (product) => {
  if (!product) return null;
  
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: formatPrice(product.price),
    stock: product.stock,
    category: product.category,
    userId: product.userId,
    createdAt: product.createdAt
  };
};

/**
 * Sanitize order object for response
 * @param {Object} order - Order object
 * @returns {Object} - Sanitized order object
 */
const sanitizeOrder = (order) => {
  if (!order) return null;
  
  return {
    id: order.id,
    userId: order.userId,
    description: order.description,
    totalPrice: formatPrice(order.totalPrice),
    status: order.status,
    products: order.products || [],
    createdAt: order.createdAt
  };
};

/**
 * Extract error message from error object
 * @param {Error} error - Error object
 * @returns {String} - Error message
 */
const getErrorMessage = (error) => {
  if (error.message) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

/**
 * Check if MongoDB duplicate key error
 * @param {Error} error - Error object
 * @returns {Boolean} - True if duplicate key error
 */
const isDuplicateKeyError = (error) => {
  return error.code === 11000 || error.code === 11001;
};

/**
 * Extract duplicate field from MongoDB error
 * @param {Error} error - MongoDB error object
 * @returns {String} - Field name that caused duplicate error
 */
const getDuplicateField = (error) => {
  if (!isDuplicateKeyError(error)) return null;
  
  const match = error.message.match(/index: (\w+)_/);
  return match ? match[1] : 'field';
};

/**
 * Sleep/delay function for testing or rate limiting
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate random alphanumeric string
 * @param {Number} length - Length of string
 * @returns {String} - Random string
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  sanitizeUser,
  getPaginationMetadata,
  formatPrice,
  calculateTotalPrice,
  isValidUUID,
  generateOrderDescription,
  isEmptyString,
  capitalizeFirst,
  formatDate,
  isPositiveNumber,
  isNonNegativeInteger,
  sanitizeProduct,
  sanitizeOrder,
  getErrorMessage,
  isDuplicateKeyError,
  getDuplicateField,
  sleep,
  generateRandomString
};