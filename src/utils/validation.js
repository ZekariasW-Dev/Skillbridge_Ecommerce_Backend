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
 * Validate password according to very strong requirements (Page 4 PDF)
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
 * Validate username according to requirements (Page 4 PDF)
 * Username must contain only letters and numbers (alphanumeric)
 * @param {string} username - Username to validate
 * @returns {string[]} - Array of validation error messages
 */
const validateUsername = (username) => {
  const errors = [];
  
  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
  } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
    errors.push('Username must contain only letters and numbers (no spaces, special characters, or symbols allowed)');
  }
  
  return errors;
};

/**
 * Validate product data according to User Story 3 requirements
 * @param {object} product - Product object to validate
 * @returns {string[]} - Array of validation error messages
 */
const validateProduct = (product) => {
  const errors = [];
  
  // name: Must be a non-empty string (between 3 and 100 characters)
  if (!product.name || typeof product.name !== 'string' || product.name.trim().length === 0) {
    errors.push('Product name is required');
  } else if (product.name.trim().length < 3 || product.name.trim().length > 100) {
    errors.push('Product name must be between 3 and 100 characters');
  }
  
  // description: Must be a non-empty string (at least 10 characters long)
  if (!product.description || typeof product.description !== 'string' || product.description.trim().length === 0) {
    errors.push('Product description is required');
  } else if (product.description.trim().length < 10) {
    errors.push('Product description must be at least 10 characters long');
  }
  
  // price: Must be a positive number greater than 0
  if (product.price === undefined || product.price === null) {
    errors.push('Product price is required');
  } else if (typeof product.price !== 'number' || product.price <= 0) {
    errors.push('Product price must be a positive number greater than 0');
  }
  
  // stock: Must be a non-negative integer (0 or more)
  if (product.stock === undefined || product.stock === null) {
    errors.push('Product stock is required');
  } else if (!Number.isInteger(product.stock) || product.stock < 0) {
    errors.push('Product stock must be a non-negative integer (0 or more)');
  }
  
  // category: Required field
  if (!product.category || typeof product.category !== 'string' || product.category.trim().length === 0) {
    errors.push('Product category is required');
  }
  
  return errors;
};

/**
 * Validate product data for partial updates (User Story 4)
 * Only validates fields that are provided in the request
 * @param {object} product - Product object to validate (partial)
 * @returns {string[]} - Array of validation error messages
 */
const validateProductUpdate = (product) => {
  const errors = [];
  
  // name: Must be a non-empty string (between 3 and 100 characters) - only if provided
  if (product.name !== undefined) {
    if (!product.name || typeof product.name !== 'string' || product.name.trim().length === 0) {
      errors.push('Product name must be a non-empty string');
    } else if (product.name.trim().length < 3 || product.name.trim().length > 100) {
      errors.push('Product name must be between 3 and 100 characters');
    }
  }
  
  // description: Must be a non-empty string (at least 10 characters long) - only if provided
  if (product.description !== undefined) {
    if (!product.description || typeof product.description !== 'string' || product.description.trim().length === 0) {
      errors.push('Product description must be a non-empty string');
    } else if (product.description.trim().length < 10) {
      errors.push('Product description must be at least 10 characters long');
    }
  }
  
  // price: Must be a positive number greater than 0 - only if provided
  if (product.price !== undefined) {
    if (product.price === null || typeof product.price !== 'number' || product.price <= 0) {
      errors.push('Product price must be a positive number greater than 0');
    }
  }
  
  // stock: Must be a non-negative integer (0 or more) - only if provided
  if (product.stock !== undefined) {
    if (product.stock === null || !Number.isInteger(product.stock) || product.stock < 0) {
      errors.push('Product stock must be a non-negative integer (0 or more)');
    }
  }
  
  // category: Must be a non-empty string - only if provided
  if (product.category !== undefined) {
    if (!product.category || typeof product.category !== 'string' || product.category.trim().length === 0) {
      errors.push('Product category must be a non-empty string');
    }
  }
  
  return errors;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateProduct,
  validateProductUpdate
};