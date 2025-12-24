const {
  validateEmail,
  validatePassword,
  validateUsername,
  validateProduct,
  validateProductUpdate
} = require('../../src/utils/validation');

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'a@b.co'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      const strongPasswords = [
        'StrongPass123!',
        'MySecure456@',
        'Complex789#',
        'ValidPass123$'
      ];

      strongPasswords.forEach(password => {
        const errors = validatePassword(password);
        expect(errors).toHaveLength(0);
      });
    });

    it('should reject passwords that are too short', () => {
      const shortPasswords = ['Short1!', 'Abc123!', '1234567'];

      shortPasswords.forEach(password => {
        const errors = validatePassword(password);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(error => error.includes('8 characters'))).toBe(true);
      });
    });

    it('should reject passwords without uppercase letters', () => {
      const errors = validatePassword('lowercase123!');
      expect(errors.some(error => error.includes('uppercase letter'))).toBe(true);
    });

    it('should reject passwords without lowercase letters', () => {
      const errors = validatePassword('UPPERCASE123!');
      expect(errors.some(error => error.includes('lowercase letter'))).toBe(true);
    });

    it('should reject passwords without numbers', () => {
      const errors = validatePassword('NoNumbers!');
      expect(errors.some(error => error.includes('number'))).toBe(true);
    });

    it('should reject passwords without special characters', () => {
      const errors = validatePassword('NoSpecialChars123');
      expect(errors.some(error => error.includes('special character'))).toBe(true);
    });

    it('should handle null and undefined passwords', () => {
      expect(validatePassword(null).length).toBeGreaterThan(0);
      expect(validatePassword(undefined).length).toBeGreaterThan(0);
      expect(validatePassword('').length).toBeGreaterThan(0);
    });

    it('should return multiple errors for very weak passwords', () => {
      const errors = validatePassword('weak');
      expect(errors.length).toBeGreaterThan(1);
      expect(errors.some(error => error.includes('8 characters'))).toBe(true);
      expect(errors.some(error => error.includes('uppercase'))).toBe(true);
      expect(errors.some(error => error.includes('number'))).toBe(true);
      expect(errors.some(error => error.includes('special character'))).toBe(true);
    });
  });

  describe('validateUsername', () => {
    it('should accept valid alphanumeric usernames', () => {
      const validUsernames = [
        'user123',
        'testUser456',
        'MyUsername789',
        'abc123def',
        'User1'
      ];

      validUsernames.forEach(username => {
        const errors = validateUsername(username);
        expect(errors).toHaveLength(0);
      });
    });

    it('should reject usernames with special characters', () => {
      const invalidUsernames = [
        'user@name',
        'test_user',
        'user-name',
        'user.name',
        'user name',
        'user!',
        'user#123'
      ];

      invalidUsernames.forEach(username => {
        const errors = validateUsername(username);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('letters and numbers');
      });
    });

    it('should reject empty or null usernames', () => {
      const emptyUsernames = ['', null, undefined, '   '];

      emptyUsernames.forEach(username => {
        const errors = validateUsername(username);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('required');
      });
    });

    it('should handle usernames with whitespace', () => {
      const errors = validateUsername('  user123  ');
      expect(errors).toHaveLength(0); // Should be valid after trimming
    });
  });

  describe('validateProduct', () => {
    const validProduct = {
      name: 'Test Product',
      description: 'This is a test product with sufficient description length',
      price: 99.99,
      stock: 10,
      category: 'Electronics'
    };

    it('should accept valid product data', () => {
      const errors = validateProduct(validProduct);
      expect(errors).toHaveLength(0);
    });

    it('should reject product with missing name', () => {
      const product = { ...validProduct };
      delete product.name;
      
      const errors = validateProduct(product);
      expect(errors.some(error => error.includes('name is required'))).toBe(true);
    });

    it('should reject product with name too short', () => {
      const product = { ...validProduct, name: 'AB' };
      
      const errors = validateProduct(product);
      expect(errors.some(error => error.includes('between 3 and 100 characters'))).toBe(true);
    });

    it('should reject product with name too long', () => {
      const product = { ...validProduct, name: 'A'.repeat(101) };
      
      const errors = validateProduct(product);
      expect(errors.some(error => error.includes('between 3 and 100 characters'))).toBe(true);
    });

    it('should reject product with description too short', () => {
      const product = { ...validProduct, description: 'Short' };
      
      const errors = validateProduct(product);
      expect(errors.some(error => error.includes('at least 10 characters'))).toBe(true);
    });

    it('should reject product with invalid price', () => {
      const invalidPrices = [0, -10, null, undefined, 'not-a-number'];
      
      invalidPrices.forEach(price => {
        const product = { ...validProduct, price };
        const errors = validateProduct(product);
        expect(errors.some(error => error.includes('positive number'))).toBe(true);
      });
    });

    it('should reject product with invalid stock', () => {
      const invalidStocks = [-1, 1.5, null, undefined, 'not-a-number'];
      
      invalidStocks.forEach(stock => {
        const product = { ...validProduct, stock };
        const errors = validateProduct(product);
        expect(errors.some(error => error.includes('non-negative integer'))).toBe(true);
      });
    });

    it('should accept product with zero stock', () => {
      const product = { ...validProduct, stock: 0 };
      const errors = validateProduct(product);
      expect(errors).toHaveLength(0);
    });

    it('should reject product with missing category', () => {
      const product = { ...validProduct };
      delete product.category;
      
      const errors = validateProduct(product);
      expect(errors.some(error => error.includes('category is required'))).toBe(true);
    });

    it('should handle multiple validation errors', () => {
      const invalidProduct = {
        name: 'AB', // Too short
        description: 'Short', // Too short
        price: -10, // Invalid
        stock: -1, // Invalid
        category: '' // Empty
      };
      
      const errors = validateProduct(invalidProduct);
      expect(errors.length).toBeGreaterThan(4);
    });
  });

  describe('validateProductUpdate', () => {
    it('should accept valid partial updates', () => {
      const updates = [
        { name: 'Updated Product' },
        { price: 149.99 },
        { stock: 20 },
        { description: 'Updated description with sufficient length' },
        { category: 'Updated Category' }
      ];

      updates.forEach(update => {
        const errors = validateProductUpdate(update);
        expect(errors).toHaveLength(0);
      });
    });

    it('should accept multiple field updates', () => {
      const update = {
        name: 'Updated Product',
        price: 149.99,
        stock: 20
      };
      
      const errors = validateProductUpdate(update);
      expect(errors).toHaveLength(0);
    });

    it('should validate provided fields only', () => {
      const update = { name: 'AB' }; // Invalid name, but other fields not provided
      
      const errors = validateProductUpdate(update);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('between 3 and 100 characters');
    });

    it('should not validate missing fields', () => {
      const update = {}; // No fields provided
      
      const errors = validateProductUpdate(update);
      expect(errors).toHaveLength(0); // No validation errors for missing fields
    });

    it('should validate each provided field correctly', () => {
      const update = {
        name: 'AB', // Too short
        price: -10, // Invalid
        stock: -1, // Invalid
        description: 'Short', // Too short
        category: '' // Empty
      };
      
      const errors = validateProductUpdate(update);
      expect(errors.length).toBe(5);
    });

    it('should handle null and undefined values', () => {
      const update = {
        name: null,
        price: null,
        stock: null,
        description: undefined,
        category: undefined
      };
      
      const errors = validateProductUpdate(update);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});