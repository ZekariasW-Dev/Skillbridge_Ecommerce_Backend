# E-commerce API Documentation

Welcome to the comprehensive documentation for the E-commerce RESTful API. This directory contains all the resources you need to understand, integrate, and test the API.

## 📚 Documentation Files

### 📖 [API Documentation](./API_DOCUMENTATION.md)
Complete API reference with detailed endpoint documentation, request/response examples, authentication requirements, and data models.

**Contents:**
- Overview and key features
- Authentication and authorization
- All endpoint specifications
- Request/response formats
- Error handling
- Rate limiting
- Data models and schemas
- Status codes reference

### 🚀 [API Usage Guide](./API_USAGE_GUIDE.md)
Practical guide with real-world examples, common use cases, and integration patterns.

**Contents:**
- Quick start guide
- Step-by-step authentication flow
- Product management examples
- Order placement workflows
- Error handling examples
- Rate limiting best practices
- Frontend/mobile integration examples
- Troubleshooting guide

### 📋 [Postman Collection](./Ecommerce_API.postman_collection.json)
Ready-to-use Postman collection with all API endpoints, example requests, and automated token management.

**Features:**
- All endpoints organized by category
- Example requests with sample data
- Automatic JWT token extraction and storage
- Environment variables for easy configuration
- Error testing scenarios
- Rate limiting tests

### 🔧 [OpenAPI Specification](./openapi.yaml)
Complete OpenAPI 3.0 specification for the API, compatible with Swagger UI and other OpenAPI tools.

**Features:**
- Full API specification in YAML format
- Request/response schemas
- Authentication configuration
- Example values and descriptions
- Compatible with code generation tools
- Swagger UI ready

## 🎯 Quick Start

### 1. Choose Your Tool

**For API Testing:**
- Import `Ecommerce_API.postman_collection.json` into Postman
- Use the [API Usage Guide](./API_USAGE_GUIDE.md) for curl examples

**For Integration:**
- Reference the [API Documentation](./API_DOCUMENTATION.md) for complete specifications
- Use the [OpenAPI spec](./openapi.yaml) for code generation

**For Development:**
- Follow the [API Usage Guide](./API_USAGE_GUIDE.md) for setup instructions
- Use the Postman collection for interactive testing

### 2. Basic Setup

```bash
# Start the API server
npm start

# Test the API is running
curl http://localhost:3000/health

# Create admin user (if not exists)
npm run setup-admin
```

### 3. Authentication Flow

```bash
# 1. Register a user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser123", "email": "test@example.com", "password": "SecurePass123!"}'

# 2. Login and get token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "SecurePass123!"}'

# 3. Use token for authenticated requests
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 API Overview

### Endpoints Summary

| Category | Endpoint | Method | Auth | Description |
|----------|----------|--------|------|-------------|
| **Health** | `/health` | GET | None | API health check |
| **Health** | `/` | GET | None | API information |
| **Auth** | `/auth/register` | POST | None | User registration |
| **Auth** | `/auth/login` | POST | None | User login |
| **Products** | `/products` | GET | None | List/search products |
| **Products** | `/products/:id` | GET | None | Get product details |
| **Products** | `/products` | POST | Admin | Create product |
| **Products** | `/products/:id` | PUT | Admin | Update product |
| **Products** | `/products/:id` | DELETE | Admin | Delete product |
| **Orders** | `/orders` | POST | User | Place order |
| **Orders** | `/orders` | GET | User | View order history |

### Key Features

- 🔐 **JWT Authentication** with role-based access control
- 📦 **Product Management** with full CRUD operations
- 🔍 **Search & Pagination** for efficient data retrieval
- 🛒 **Order Processing** with transaction safety
- 🛡️ **Rate Limiting** for API protection
- 📊 **Error Handling** with detailed error messages
- 🧪 **Comprehensive Testing** with unit and integration tests

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "object": { /* Response data */ },
  "errors": []
}
```

## 🔧 Integration Examples

### JavaScript/Node.js

```javascript
const API_BASE = 'http://localhost:3000';

// Login and get token
const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Get products with search
const getProducts = async (search = '', page = 1) => {
  const params = new URLSearchParams({ page, pageSize: 10 });
  if (search) params.append('search', search);
  
  const response = await fetch(`${API_BASE}/products?${params}`);
  return response.json();
};
```

### Python

```python
import requests

class EcommerceAPI:
    def __init__(self, base_url='http://localhost:3000'):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f'{self.base_url}/auth/login', json={
            'email': email,
            'password': password
        })
        data = response.json()
        if data['success']:
            self.token = data['object']['token']
        return data
    
    def get_products(self, search='', page=1):
        params = {'page': page, 'pageSize': 10}
        if search:
            params['search'] = search
        
        response = requests.get(f'{self.base_url}/products', params=params)
        return response.json()
```

### cURL Examples

```bash
# Complete user journey
# 1. Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "johndoe123", "email": "john@example.com", "password": "SecurePass123!"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "SecurePass123!"}' \
  | jq -r '.object.token')

# 3. Browse products
curl "http://localhost:3000/products?search=laptop&page=1&pageSize=5"

# 4. Place order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"description": "My order", "products": [{"productId": "product-123", "quantity": 1}]}'

# 5. View order history
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN"
```

## 🧪 Testing

### Available Test Scripts

```bash
# Integration tests
npm run test-api              # Complete API test suite
npm run test-login            # Authentication tests
npm run test-create-product   # Product creation tests
npm run test-place-order      # Order placement tests
npm run test-view-order-history # Order history tests

# Security tests
npm run test-validation-security # Input validation tests
npm run test-rate-limiting       # Rate limiting tests
npm run test-error-handling      # Error handling tests
npm run test-duplicate-check     # Duplicate prevention tests

# Unit tests
npm run test:unit            # All unit tests with mocking
npm run test:coverage        # Unit tests with coverage report
```

### Test Categories

- **Authentication Tests**: Registration, login, token validation
- **Product Tests**: CRUD operations, search, pagination
- **Order Tests**: Order placement, history, validation
- **Security Tests**: Input validation, rate limiting, authorization
- **Error Tests**: Error handling, edge cases, invalid inputs

## 📈 Performance & Limits

### Rate Limits

- **General API**: 1000 requests per 15 minutes
- **Authentication**: 50 requests per 15 minutes
- **Order Placement**: 10 requests per 1 minute
- **Admin Operations**: 100 requests per 5 minutes
- **Search Operations**: 200 requests per 1 minute

### Pagination Limits

- **Default Page Size**: 10 items
- **Maximum Page Size**: 100 items
- **Minimum Page**: 1

### Validation Limits

- **Username**: 3-30 characters, alphanumeric only
- **Password**: Minimum 8 characters, very strong requirements
- **Product Name**: 3-100 characters
- **Product Description**: Minimum 10 characters
- **Order Description**: Maximum 500 characters

## 🔒 Security Features

- **JWT Authentication** with secure token generation
- **Role-based Access Control** (User/Admin roles)
- **Input Validation** with comprehensive error messages
- **Rate Limiting** to prevent API abuse
- **Password Hashing** with bcrypt
- **SQL Injection Prevention** through validation
- **CORS Support** for cross-origin requests

## 🛠️ Development Tools

### Recommended Tools

1. **Postman** - API testing and development
2. **Swagger UI** - API documentation visualization
3. **curl** - Command-line testing
4. **jq** - JSON processing for scripts
5. **HTTPie** - User-friendly HTTP client

### Code Generation

Use the OpenAPI specification to generate client SDKs:

```bash
# Generate JavaScript client
openapi-generator-cli generate -i docs/openapi.yaml -g javascript -o clients/javascript

# Generate Python client
openapi-generator-cli generate -i docs/openapi.yaml -g python -o clients/python

# Generate Java client
openapi-generator-cli generate -i docs/openapi.yaml -g java -o clients/java
```

## 📞 Support

### Getting Help

1. **Documentation**: Start with the [API Documentation](./API_DOCUMENTATION.md)
2. **Examples**: Check the [API Usage Guide](./API_USAGE_GUIDE.md)
3. **Testing**: Use the Postman collection for interactive testing
4. **Issues**: Review the troubleshooting section in the usage guide

### Contributing

1. Follow the existing API patterns and conventions
2. Update documentation when adding new endpoints
3. Add tests for new functionality
4. Maintain backward compatibility

---

**Documentation Version:** 1.0.0  
**API Version:** 1.0.0  
**Last Updated:** December 2023