/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password according to requirements
 * @param {string} password - Password to validate
 * @returns {string[]} - Array of validation error messages
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter (A-Z)');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include at least one lowercase letter (a-z)');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must include at least one number (0-9)');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must include at least one special character (e.g., !@#$%^&*)');
  }
  
  return errors;
};

/**
 * Validate username according to requirements
 * @param {string} username - Username to validate
 * @returns {string[]} - Array of validation error messages
 */
const validateUsername = (username) => {
  const errors = [];
  
  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
  } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
    errors.push('Username must be alphanumeric (letters and numbers only, no special characters or spaces)');
  }
  
  return errors;
};

/**
 * Validate product data
 * @param {object} product - Product object to validate
 * @returns {string[]} - Array of validation error messages
 */
const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim().length === 0) {
    errors.push('Product name is required');
  }
  
  if (!product.description || product.description.trim().length === 0) {
    errors.push('Product description is required');
  }
  
  if (product.price === undefined || product.price === null || product.price <= 0) {
    errors.push('Product price must be a positive number');
  }
  
  if (product.stock === undefined || product.stock === null || product.stock < 0 || !Number.isInteger(product.stock)) {
    errors.push('Product stock must be a non-negative integer');
  }
  
  if (!product.category || product.category.trim().length === 0) {
    errors.push('Product category is required');
  }
  
  return errors;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateProduct
};