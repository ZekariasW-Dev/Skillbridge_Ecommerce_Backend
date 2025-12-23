const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least 1 number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least 1 special character');
  }
  
  return errors;
};

const validateUsername = (username) => {
  const errors = [];
  
  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
  } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
    errors.push('Username must contain only letters and numbers');
  }
  
  return errors;
};

const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || product.name.trim().length < 3 || product.name.trim().length > 100) {
    errors.push('Product name must be between 3 and 100 characters');
  }
  
  if (!product.description || product.description.trim().length < 10) {
    errors.push('Product description must be at least 10 characters');
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('Product price must be a positive number');
  }
  
  if (product.stock === undefined || product.stock < 0 || !Number.isInteger(product.stock)) {
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