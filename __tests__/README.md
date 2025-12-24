# Unit Tests for E-commerce API

This directory contains comprehensive unit tests for the E-commerce RESTful API backend. All tests use database mocking to ensure fast, isolated testing without requiring a real database connection.

## 🧪 Test Structure

```
__tests__/
├── controllers/           # Controller unit tests
│   ├── authController.test.js
│   ├── productController.test.js
│   └── orderController.test.js
├── middlewares/          # Middleware unit tests
│   └── auth.test.js
├── utils/               # Utility function tests
│   ├── validation.test.js
│   └── responses.test.js
├── setup.js            # Jest setup and global mocks
└── README.md           # This file
```

## 🚀 Running Tests

### Run All Unit Tests
```bash
npm test                    # Basic test run
npm run test:unit          # Comprehensive test run with reporting
npm run test:coverage      # Run with coverage report
npm run test:watch         # Watch mode for development
```

### Run Specific Test Files
```bash
npm test authController    # Test authentication controller
npm test productController # Test product controller
npm test orderController   # Test order controller
npm test auth.test         # Test auth middleware
npm test validation        # Test validation utilities
```

## 📊 Test Coverage

The unit tests provide comprehensive coverage for:

### Controllers (Business Logic)
- **Authentication Controller**
  - User registration with validation
  - User login with JWT generation
  - Error handling for invalid inputs
  - Duplicate email/username detection
  - Input normalization (trimming, case handling)

- **Product Controller**
  - Product creation (admin only)
  - Product updates (partial updates)
  - Product listing with pagination
  - Product search functionality
  - Product details retrieval
  - Product deletion
  - Input validation and error handling

- **Order Controller**
  - Order creation with transaction handling
  - Stock validation and updates
  - Order description handling (custom + auto-generated)
  - Order history retrieval
  - User isolation (users only see their orders)
  - Multiple product orders

### Middleware
- **Authentication Middleware**
  - JWT token validation
  - Admin role verification
  - Error handling for invalid/expired tokens
  - Authorization header parsing

### Utilities
- **Validation Functions**
  - Email format validation
  - Password strength validation (very strong requirements)
  - Username format validation (alphanumeric only)
  - Product data validation
  - Partial update validation

- **Response Functions**
  - Standard response format creation
  - Paginated response generation
  - Product list response formatting
  - Error response handling

## 🔧 Test Configuration

### Jest Configuration
- **Environment**: Node.js
- **Timeout**: 10 seconds per test
- **Setup**: Global mocks and utilities
- **Coverage**: Comprehensive coverage reporting

### Database Mocking
All database operations are mocked using Jest mocks:
- No real database connection required
- Fast test execution
- Isolated test environment
- Predictable test data

### Key Mocks
```javascript
// Database connection mock
jest.mock('../src/config/db')

// Model mocks
jest.mock('../src/models/User')
jest.mock('../src/models/Product')
jest.mock('../src/models/Order')
```

## 🎯 Test Categories

### Happy Path Tests
- Valid inputs and expected successful outcomes
- Proper data flow and response formats
- Business logic validation

### Error Handling Tests
- Invalid inputs and validation failures
- Authentication and authorization errors
- Database operation failures
- Edge cases and boundary conditions

### Security Tests
- Authentication bypass attempts
- Authorization violations
- Input sanitization
- SQL injection prevention (through validation)

### Integration Points
- Middleware chain testing
- Controller-model interaction
- Request-response flow validation

## 📈 Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 95%
- **Lines**: > 90%

## 🔍 Test Data Patterns

### Mock User Data
```javascript
const mockUser = {
  id: 'user-uuid-123',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  createdAt: new Date()
};
```

### Mock Product Data
```javascript
const mockProduct = {
  id: 'product-uuid-123',
  name: 'Test Product',
  description: 'Test product description',
  price: 99.99,
  stock: 10,
  category: 'Electronics'
};
```

### Mock Order Data
```javascript
const mockOrder = {
  id: 'order-uuid-123',
  userId: 'user-uuid-123',
  description: 'Test order',
  totalPrice: 199.98,
  status: 'pending',
  products: [...],
  createdAt: new Date()
};
```

## 🛠️ Development Guidelines

### Writing New Tests
1. Follow the existing test structure
2. Use descriptive test names
3. Test both success and failure scenarios
4. Mock external dependencies
5. Verify all response fields
6. Test edge cases and boundary conditions

### Test Naming Convention
```javascript
describe('Controller/Function Name', () => {
  describe('HTTP Method /endpoint', () => {
    it('should perform expected action successfully', () => {
      // Test implementation
    });
    
    it('should return 400 for invalid input', () => {
      // Error case test
    });
  });
});
```

### Assertion Patterns
```javascript
// Response structure validation
expect(response.status).toBe(200);
expect(response.body.success).toBe(true);
expect(response.body).toHaveProperty('object');

// Mock verification
expect(MockModel.create).toHaveBeenCalledWith(expectedData);
expect(MockModel.findById).toHaveBeenCalledTimes(1);
```

## 🚨 Common Issues

### Mock Not Working
- Ensure mocks are defined before imports
- Check mock path is correct
- Verify mock is cleared between tests

### Test Timeout
- Increase timeout in Jest config
- Check for unresolved promises
- Verify async/await usage

### Coverage Gaps
- Add tests for uncovered branches
- Test error conditions
- Include edge cases

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodebestpractices#-6-testing-and-overall-quality-practices)

## 🎉 Benefits of Unit Testing

✅ **Fast Execution**: No database setup required  
✅ **Isolated Testing**: Each component tested independently  
✅ **Reliable Results**: Consistent test outcomes  
✅ **Early Bug Detection**: Catch issues before integration  
✅ **Documentation**: Tests serve as living documentation  
✅ **Refactoring Safety**: Confidence when making changes  
✅ **Code Quality**: Encourages better code structure