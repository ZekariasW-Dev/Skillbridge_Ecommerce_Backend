# E-commerce API Usage Guide

## Quick Start

### 1. Setup and Installation

```bash
# Clone the repository
git clone https://github.com/ZekariasW-Dev/Skillbridge_Ecommerce_Backend.git
cd Skillbridge_Ecommerce_Backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret

# Create admin user
npm run setup-admin

# Start the server
npm start
```

### 2. Test the API

```bash
# Check if API is running
curl http://localhost:3000/health

# Run comprehensive tests
npm run test-api
```

## Authentication Flow

### Step 1: Register a New User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe123",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "object": {
    "id": "user-uuid-123",
    "username": "johndoe123",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2023-12-01T10:00:00.000Z"
  },
  "errors": []
}
```

### Step 2: Login and Get JWT Token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "object": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid-123",
      "username": "johndoe123",
      "email": "john@example.com",
      "role": "user"
    }
  },
  "errors": []
}
```

### Step 3: Use Token for Authenticated Requests

```bash
# Save the token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use token in subsequent requests
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN"
```

## Product Management

### Browse Products (Public)

```bash
# Get all products with default pagination
curl http://localhost:3000/products

# Get products with custom pagination
curl "http://localhost:3000/products?page=2&pageSize=5"

# Search for products
curl "http://localhost:3000/products?search=iPhone"

# Combined search and pagination
curl "http://localhost:3000/products?search=laptop&page=1&pageSize=20"
```

### Get Product Details (Public)

```bash
curl http://localhost:3000/products/product-uuid-123
```

### Admin Product Operations

```bash
# Login as admin first
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123!"
  }'

# Save admin token
ADMIN_TOKEN="admin-jwt-token-here"

# Create a new product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "MacBook Pro 16-inch",
    "description": "Professional laptop with M3 Pro chip, perfect for developers and creators",
    "price": 2499.99,
    "stock": 15,
    "category": "Computers"
  }'

# Update product (partial update)
curl -X PUT http://localhost:3000/products/product-uuid-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "price": 2299.99,
    "stock": 20
  }'

# Delete product
curl -X DELETE http://localhost:3000/products/product-uuid-123 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Order Management

### Place an Order

```bash
# Order with custom description
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Birthday gift for my friend - gaming setup",
    "products": [
      {
        "productId": "product-uuid-123",
        "quantity": 2
      },
      {
        "productId": "product-uuid-456",
        "quantity": 1
      }
    ]
  }'

# Order with auto-generated description
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "products": [
      {
        "productId": "product-uuid-123",
        "quantity": 1
      }
    ]
  }'
```

### View Order History

```bash
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN"
```

## Error Handling Examples

### Validation Errors (400 Bad Request)

```bash
# Invalid registration data
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@user!",
    "email": "invalid-email",
    "password": "weak"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Registration failed",
  "object": null,
  "errors": [
    "Username must contain only letters and numbers",
    "Email must be a valid email address format",
    "Password must be at least 8 characters long",
    "Password must include at least one uppercase letter"
  ]
}
```

### Authentication Errors (401 Unauthorized)

```bash
# Request without token
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "products": [{"productId": "test", "quantity": 1}]
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Authentication token is required",
  "object": null,
  "errors": ["Authentication token is required"]
}
```

### Authorization Errors (403 Forbidden)

```bash
# Non-admin trying to create product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "This should fail",
    "price": 99.99,
    "stock": 10,
    "category": "Test"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Admin role required to access this resource",
  "object": null,
  "errors": ["Admin role required to access this resource"]
}
```

### Not Found Errors (404 Not Found)

```bash
# Non-existent product
curl http://localhost:3000/products/non-existent-id
```

**Response:**
```json
{
  "success": false,
  "message": "Product not found",
  "object": null,
  "errors": ["Product not found"]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

### Rate Limit Headers

Every response includes rate limit information:

```http
RateLimit-Limit: 1000
RateLimit-Remaining: 999
RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded (429 Too Many Requests)

```bash
# Make too many requests quickly
for i in {1..60}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrong"}'
done
```

**Response:**
```json
{
  "success": false,
  "message": "Too many requests",
  "object": null,
  "errors": ["Too many requests from this IP, please try again later"]
}
```

## Advanced Usage Patterns

### Pagination Best Practices

```bash
# Start with first page
curl "http://localhost:3000/products?page=1&pageSize=10"

# Use response data to navigate
# If totalPages > currentPage, fetch next page
curl "http://localhost:3000/products?page=2&pageSize=10"

# Adjust page size based on needs
curl "http://localhost:3000/products?pageSize=50"  # Larger page
curl "http://localhost:3000/products?pageSize=5"   # Smaller page
```

### Search Optimization

```bash
# Specific search terms work better
curl "http://localhost:3000/products?search=iPhone"     # Good
curl "http://localhost:3000/products?search=phone"      # Broader
curl "http://localhost:3000/products?search=i"          # Too broad

# Combine search with pagination
curl "http://localhost:3000/products?search=laptop&pageSize=20"
```

### Order Management Workflow

```bash
# 1. Browse products
curl "http://localhost:3000/products?search=gaming"

# 2. Get product details
curl "http://localhost:3000/products/product-uuid-123"

# 3. Place order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Gaming setup for home office",
    "products": [
      {"productId": "product-uuid-123", "quantity": 1},
      {"productId": "product-uuid-456", "quantity": 2}
    ]
  }'

# 4. Check order history
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN"
```

## Testing and Development

### Running Tests

```bash
# Run all integration tests
npm run test-api

# Test specific functionality
npm run test-login
npm run test-create-product
npm run test-place-order
npm run test-view-order-history

# Test security features
npm run test-validation-security
npm run test-rate-limiting
npm run test-error-handling
npm run test-duplicate-check

# Run unit tests
npm run test:unit
npm run test:coverage
```

### Development Tools

#### Using Postman

1. Import the collection: `docs/Ecommerce_API.postman_collection.json`
2. Set up environment variables:
   - `base_url`: `http://localhost:3000`
   - `jwt_token`: (will be set automatically after login)
   - `admin_token`: (will be set automatically after admin login)

#### Using OpenAPI/Swagger

The API specification is available in `docs/openapi.yaml`. You can:

1. Use Swagger UI to visualize the API
2. Generate client SDKs
3. Validate requests and responses

### Environment Variables

Create a `.env` file with:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=3000
NODE_ENV=development
```

## Common Use Cases

### E-commerce Frontend Integration

```javascript
// Frontend JavaScript example
class EcommerceAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('jwt_token');
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      this.token = data.object.token;
      localStorage.setItem('jwt_token', this.token);
    }
    return data;
  }

  async getProducts(page = 1, search = '') {
    const params = new URLSearchParams({ page, pageSize: 12 });
    if (search) params.append('search', search);
    
    const response = await fetch(`${this.baseURL}/products?${params}`);
    return response.json();
  }

  async placeOrder(products, description = '') {
    const response = await fetch(`${this.baseURL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ products, description })
    });
    return response.json();
  }
}

// Usage
const api = new EcommerceAPI();
await api.login('user@example.com', 'password');
const products = await api.getProducts(1, 'laptop');
const order = await api.placeOrder([
  { productId: 'product-123', quantity: 1 }
], 'My new laptop order');
```

### Mobile App Integration

```swift
// iOS Swift example
class EcommerceAPI {
    private let baseURL = "http://localhost:3000"
    private var token: String?
    
    func login(email: String, password: String) async throws -> LoginResponse {
        let url = URL(string: "\(baseURL)/auth/login")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["email": email, "password": password]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(LoginResponse.self, from: data)
        
        if response.success {
            self.token = response.object.token
        }
        
        return response
    }
    
    func getProducts(page: Int = 1, search: String = "") async throws -> ProductListResponse {
        var components = URLComponents(string: "\(baseURL)/products")!
        components.queryItems = [
            URLQueryItem(name: "page", value: "\(page)"),
            URLQueryItem(name: "pageSize", value: "20")
        ]
        if !search.isEmpty {
            components.queryItems?.append(URLQueryItem(name: "search", value: search))
        }
        
        let (data, _) = try await URLSession.shared.data(from: components.url!)
        return try JSONDecoder().decode(ProductListResponse.self, from: data)
    }
}
```

## Troubleshooting

### Common Issues

1. **"Authentication token is required"**
   - Make sure to include the `Authorization: Bearer <token>` header
   - Verify the token is valid and not expired

2. **"Admin role required"**
   - Use admin credentials to get an admin token
   - Regular users cannot perform admin operations

3. **"Product not found"**
   - Verify the product ID exists
   - Check if the product was deleted

4. **"Insufficient stock"**
   - Check product stock before placing orders
   - Reduce order quantity or choose different products

5. **Rate limiting errors**
   - Wait for the rate limit window to reset
   - Implement exponential backoff in your client

### Debug Mode

Set `NODE_ENV=development` to get more detailed error messages and request logging.

### Support

- Check the test files for usage examples
- Review the source code for implementation details
- Run the test suite to verify functionality

---

**API Version:** 1.0.0  
**Last Updated:** December 2023