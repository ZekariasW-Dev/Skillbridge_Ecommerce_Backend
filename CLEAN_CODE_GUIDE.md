# 🧹 Clean Code Guidelines

## 📋 Code Quality Standards

### ✅ **File Organization**

#### **Controllers** (`/src/controllers/`)
- Single responsibility principle
- Clear function names
- Proper error handling
- Comprehensive documentation

```javascript
/**
 * Create Product endpoint - User Story 3 & Page 5 PDF Requirements
 * POST /products
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const createProduct = async (req, res) => {
  try {
    // Clear, documented logic
  } catch (error) {
    // Proper error handling
  }
};
```

#### **Models** (`/src/models/`)
- Clear data structure
- Validation rules
- Proper field naming
- PDF requirement compliance

```javascript
/**
 * Product Model - Page 2 PDF Requirements
 * Handles product data operations with proper field naming
 */
class Product {
  static async create(productData) {
    // Clean, focused methods
  }
}
```

#### **Utilities** (`/src/utils/`)
- Pure functions
- Single purpose
- Well-documented
- Reusable

```javascript
/**
 * Validate product data according to Page 5 PDF specifications
 * @param {object} product - Product object to validate
 * @returns {string[]|null} - Array of validation errors or null
 */
const validateProduct = (product) => {
  // Clear validation logic
};
```

### ✅ **Naming Conventions**

#### **Variables & Functions**
```javascript
// ✅ Good - Clear, descriptive names
const userAuthToken = generateJWTToken(userData);
const validateProductData = (product) => { /* ... */ };

// ❌ Bad - Unclear, abbreviated names
const token = gen(data);
const validate = (p) => { /* ... */ };
```

#### **Constants**
```javascript
// ✅ Good - UPPER_SNAKE_CASE for constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_PAGE_SIZE = 10;

// ❌ Bad - Inconsistent naming
const maxFileSize = 5242880;
const pageSize = 10;
```

#### **Database Fields**
```javascript
// ✅ Good - PDF compliant field mapping
const orderResponse = {
  order_id: order.id,           // Page 11 PDF requirement
  total_price: order.totalPrice, // Page 10 PDF requirement
  created_at: order.createdAt   // Page 11 PDF requirement
};
```

### ✅ **Error Handling**

#### **Consistent Error Structure**
```javascript
// ✅ Good - Structured error handling
try {
  const result = await someOperation();
  return createResponse(true, 'Success', result);
} catch (error) {
  console.error('Operation failed:', error.message);
  return createResponse(false, 'Operation failed', null, [error.message]);
}
```

#### **Custom Error Classes**
```javascript
// ✅ Good - Specific error types
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}
```

### ✅ **Documentation Standards**

#### **Function Documentation**
```javascript
/**
 * Process order placement with stock validation
 * 
 * @param {string} userId - User ID from JWT token
 * @param {Array} products - Array of product objects
 * @param {string} description - Order description (optional)
 * @returns {Promise<Object>} Order response with PDF compliant fields
 * 
 * @throws {ValidationError} When product data is invalid
 * @throws {StockError} When insufficient stock available
 * 
 * PDF Requirements:
 * - Page 10: Response must contain order_id, status, total_price, products
 * - Page 11: Order history must use specific field names
 */
const processOrder = async (userId, products, description) => {
  // Implementation
};
```

#### **File Headers**
```javascript
/**
 * Order Controller - User Stories 9 & 10 Implementation
 * 
 * Handles order placement and order history retrieval
 * Implements PDF requirements from Pages 10 & 11
 * 
 * @author E-commerce API Team
 * @version 1.0.0
 * @since 2023-12-24
 */
```

### ✅ **Code Structure**

#### **Function Organization**
```javascript
// ✅ Good - Logical function order
class OrderController {
  // 1. Main public methods first
  static async createOrder(req, res) { /* ... */ }
  static async getOrderHistory(req, res) { /* ... */ }
  
  // 2. Helper methods after
  static validateOrderData(data) { /* ... */ }
  static calculateTotal(products) { /* ... */ }
  
  // 3. Private methods last
  static #processPayment(amount) { /* ... */ }
}
```

#### **Import Organization**
```javascript
// ✅ Good - Organized imports
// 1. Node.js built-in modules
const path = require('path');
const fs = require('fs');

// 2. Third-party modules
const express = require('express');
const jwt = require('jsonwebtoken');

// 3. Local modules
const { validateProduct } = require('../utils/validation');
const { createResponse } = require('../utils/responses');
const Product = require('../models/Product');
```

### ✅ **Testing Standards**

#### **Test Organization**
```javascript
// ✅ Good - Clear test structure
describe('Product Controller', () => {
  describe('createProduct', () => {
    it('should create product with valid data', async () => {
      // Arrange
      const productData = { /* test data */ };
      
      // Act
      const result = await createProduct(productData);
      
      // Assert
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid product data', async () => {
      // Test negative cases
    });
  });
});
```

### ✅ **Performance Best Practices**

#### **Database Queries**
```javascript
// ✅ Good - Efficient queries
const getProductsWithPagination = async (page, limit) => {
  const skip = (page - 1) * limit;
  return await db.collection('products')
    .find({})
    .skip(skip)
    .limit(limit)
    .toArray();
};
```

#### **Memory Management**
```javascript
// ✅ Good - Proper resource cleanup
const processLargeFile = async (filePath) => {
  let fileStream = null;
  try {
    fileStream = fs.createReadStream(filePath);
    // Process file
  } finally {
    if (fileStream) {
      fileStream.close();
    }
  }
};
```

### ✅ **Security Best Practices**

#### **Input Validation**
```javascript
// ✅ Good - Comprehensive validation
const validateUserInput = (data) => {
  const errors = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.password || data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  return errors.length > 0 ? errors : null;
};
```

#### **Sensitive Data Handling**
```javascript
// ✅ Good - Exclude sensitive data from responses
const sanitizeUserData = (user) => {
  const { password, ...safeUserData } = user;
  return safeUserData;
};
```

## 🎯 Code Review Checklist

### ✅ **Before Committing**
- [ ] Functions have single responsibility
- [ ] Variable names are descriptive
- [ ] Error handling is comprehensive
- [ ] Documentation is complete
- [ ] Tests are written and passing
- [ ] PDF requirements are met
- [ ] Security best practices followed
- [ ] Performance considerations addressed

### ✅ **File Organization**
- [ ] Files are in correct directories
- [ ] Imports are organized
- [ ] Exports are clear
- [ ] Dependencies are minimal

### ✅ **Code Quality**
- [ ] No code duplication
- [ ] Consistent formatting
- [ ] Clear logic flow
- [ ] Proper abstraction levels

## 🚀 Continuous Improvement

### **Regular Refactoring**
- Review code monthly
- Update documentation
- Optimize performance
- Enhance security

### **Team Standards**
- Code reviews required
- Consistent style guide
- Shared best practices
- Knowledge sharing

This clean code approach ensures maintainable, scalable, and professional software development.