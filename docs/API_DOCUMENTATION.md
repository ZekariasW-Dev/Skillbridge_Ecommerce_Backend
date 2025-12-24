# E-commerce RESTful API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Products](#product-endpoints)
  - [Product Images](#product-image-endpoints)
  - [Orders](#order-endpoints)
  - [Cache Management](#cache-management-endpoints)
  - [Health Check](#health-check)
- [Data Models](#data-models)
- [Status Codes](#status-codes)
- [Examples](#examples)

## Overview

The E-commerce RESTful API provides a complete backend solution for an online shopping platform. It supports user authentication, product management, order processing, and includes advanced features like search, pagination, rate limiting, and comprehensive error handling.

### Key Features
- 🔐 JWT-based authentication with role-based access control
- 📦 Complete product CRUD operations with search and pagination
- 🛒 Order management with transaction safety and stock validation
- 📸 Product image upload and management with multi-size generation
- 🗄️ High-performance caching system with intelligent invalidation
- 🛡️ Rate limiting and security features
- 📊 Comprehensive error handling and validation
- 🧪 Full test coverage with unit and integration tests

## Base URL

```
http://localhost:3000
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **User**: Can view products, place orders, view order history
- **Admin**: All user permissions + product management (create, update, delete)

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "object": {
    // Response data
  },
  "errors": []
}
```

### Error Response
```json
{
  "success": false,
  "message": "Operation failed",
  "object": null,
  "errors": [
    "Detailed error message 1",
    "Detailed error message 2"
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "products": [...],
  "currentPage": 1,
  "pageSize": 10,
  "totalPages": 5,
  "totalProducts": 50,
  "errors": []
}
```

## Error Handling

The API provides detailed error messages and appropriate HTTP status codes:

- **400 Bad Request**: Invalid input or validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error

## Rate Limiting

The API implements multi-tier rate limiting:

- **General API**: 1000 requests per 15 minutes
- **Authentication**: 50 requests per 15 minutes
- **Order Placement**: 10 requests per 1 minute
- **Admin Operations**: 100 requests per 5 minutes
- **Search Operations**: 200 requests per 1 minute

Rate limit headers are included in responses:
```http
RateLimit-Limit: 1000
RateLimit-Remaining: 999
RateLimit-Reset: 1640995200
```

---

# Endpoints

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** None required

**Request Body:**
```json
{
  "username": "johndoe123",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- **Username**: Alphanumeric only (letters and numbers), 3-30 characters, must start with letter
- **Email**: Valid email format
- **Password**: Very strong (8+ chars, uppercase, lowercase, numbers, special characters)

**Success Response (201 Created):**
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

**Error Responses:**
- **400 Bad Request**: Validation errors
- **409 Conflict**: Email or username already exists

---

### Login User

Authenticate user and receive JWT token.

**Endpoint:** `POST /auth/login`

**Authentication:** None required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK):**
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

**Error Responses:**
- **400 Bad Request**: Invalid email format or missing fields
- **401 Unauthorized**: Invalid credentials

---

## Product Endpoints

### Get All Products

Retrieve a paginated list of products with optional search.

**Endpoint:** `GET /products`

**Authentication:** None required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` or `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term for product names

**Example Requests:**
```http
GET /products
GET /products?page=2&pageSize=5
GET /products?search=iPhone
GET /products?search=laptop&page=1&pageSize=20
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "products": [
    {
      "id": "product-uuid-123",
      "name": "iPhone 15 Pro",
      "description": "Latest Apple smartphone with advanced features",
      "price": 999.99,
      "stock": 25,
      "category": "Electronics",
      "createdAt": "2023-12-01T10:00:00.000Z"
    }
  ],
  "currentPage": 1,
  "pageSize": 10,
  "totalPages": 5,
  "totalProducts": 50,
  "errors": []
}
```

**Error Responses:**
- **400 Bad Request**: Invalid pagination parameters

---

### Get Product Details

Retrieve detailed information about a specific product.

**Endpoint:** `GET /products/:id`

**Authentication:** None required

**Path Parameters:**
- `id`: Product UUID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Product details retrieved successfully",
  "object": {
    "id": "product-uuid-123",
    "name": "iPhone 15 Pro",
    "description": "Latest Apple smartphone with advanced camera system and titanium design",
    "price": 999.99,
    "stock": 25,
    "category": "Electronics",
    "userId": "admin-uuid-456",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  },
  "errors": []
}
```

**Error Responses:**
- **400 Bad Request**: Invalid or missing product ID
- **404 Not Found**: Product not found

---

### Create Product (Admin Only)

Create a new product in the catalog.

**Endpoint:** `POST /products`

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "name": "MacBook Pro 16-inch",
  "description": "Professional laptop with M3 Pro chip, perfect for developers and creators",
  "price": 2499.99,
  "stock": 15,
  "category": "Computers"
}
```

**Validation Rules:**
- **Name**: 3-100 characters, required
- **Description**: Minimum 10 characters, required
- **Price**: Positive number greater than 0, required
- **Stock**: Non-negative integer, required
- **Category**: Non-empty string, required

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "object": {
    "id": "product-uuid-456",
    "name": "MacBook Pro 16-inch",
    "description": "Professional laptop with M3 Pro chip, perfect for developers and creators",
    "price": 2499.99,
    "stock": 15,
    "category": "Computers",
    "userId": "admin-uuid-123",
    "createdAt": "2023-12-01T10:00:00.000Z"
  },
  "errors": []
}
```

**Error Responses:**
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Non-admin user

---

### Update Product (Admin Only)

Update an existing product (partial updates supported).

**Endpoint:** `PUT /products/:id`

**Authentication:** Required (Admin role)

**Path Parameters:**
- `id`: Product UUID

**Request Body (partial update example):**
```json
{
  "price": 2299.99,
  "stock": 20
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "object": {
    "id": "product-uuid-456",
    "name": "MacBook Pro 16-inch",
    "description": "Professional laptop with M3 Pro chip, perfect for developers and creators",
    "price": 2299.99,
    "stock": 20,
    "category": "Computers",
    "userId": "admin-uuid-123",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T11:00:00.000Z"
  },
  "errors": []
}
```

**Error Responses:**
- **400 Bad Request**: Validation errors or no fields provided
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Non-admin user
- **404 Not Found**: Product not found

---

### Delete Product (Admin Only)

Permanently delete a product from the catalog.

**Endpoint:** `DELETE /products/:id`

**Authentication:** Required (Admin role)

**Path Parameters:**
- `id`: Product UUID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "object": {
    "deletedProductId": "product-uuid-456",
    "deletedProductName": "MacBook Pro 16-inch"
  },
  "errors": []
}
```

**Error Responses:**
- **400 Bad Request**: Invalid or missing product ID
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Non-admin user
- **404 Not Found**: Product not found

---

## Product Image Endpoints

### Upload Product Image (Admin Only)

Upload a single image for a product with automatic processing and multi-size generation.

**Endpoint:** `POST /products/:id/image`

**Authentication:** Required (Admin role)

**Content-Type:** `multipart/form-data`

**Path Parameters:**
- `id`: Product UUID

**Form Data:**
- `image`: Image file (JPEG, PNG, or WebP, max 10MB)

**Image Processing Features:**
- Automatic format conversion to WebP for optimization
- Multiple size generation: thumbnail (150x150), medium (500x500), large (1200x1200)
- Quality optimization based on image format
- Secure filename generation with UUID
- Aspect ratio preservation with intelligent resizing

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Product image uploaded and processed successfully",
  "object": {
    "productId": "product-uuid-123",
    "images": {
      "thumbnail": {
        "path": "/uploads/thumbnails/uuid_thumb.webp",
        "size": "150x150",
        "fileSize": 8432
      },
      "medium": {
        "path": "/uploads/medium/uuid_medium.webp",
        "size": "500x500",
        "fileSize": 45678
      },
      "large": {
        "path": "/uploads/images/uuid_large.webp",
        "size": "1200x1200",
        "fileSize": 156789
      }
    },
    "uploadInfo": {
      "originalFilename": "product-photo.jpg",
      "originalSize": 2048576,
      "processedAt": "2023-12-01T10:00:00.000Z",
      "totalProcessedSizes": 3
    }
  },
  "errors": []
}
```

**Error Responses:**
- **400 Bad Request**: Invalid file type, file too large, or processing error
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Non-admin user
- **404 Not Found**: Product not found

---

### Upload Multiple Product Images (Admin Only)

Upload multiple images for a product (max 5 images).

**Endpoint:** `POST /products/:id/images`

**Authentication:** Required (Admin role)

**Content-Type:** `multipart/form-data`

**Path Parameters:**
- `id`: Product UUID

**Form Data:**
- `images`: Array of image files (max 5 files, each max 10MB)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "5 product images uploaded and processed successfully",
  "object": {
    "productId": "product-uuid-123",
    "processedImages": [
      {
        "originalFilename": "image1.jpg",
        "images": {
          "thumbnail": { "path": "/uploads/thumbnails/uuid1_thumb.webp" },
          "medium": { "path": "/uploads/medium/uuid1_medium.webp" },
          "large": { "path": "/uploads/images/uuid1_large.webp" }
        }
      }
    ],
    "summary": {
      "totalUploaded": 5,
      "totalProcessed": 15,
      "processedAt": "2023-12-01T10:00:00.000Z"
    }
  },
  "errors": []
}
```

---

### Delete Product Images (Admin Only)

Delete all images associated with a product.

**Endpoint:** `DELETE /products/:id/image`

**Authentication:** Required (Admin role)

**Path Parameters:**
- `id`: Product UUID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Product images deleted successfully",
  "object": {
    "productId": "product-uuid-123",
    "deletedFiles": 9,
    "deletedAt": "2023-12-01T10:00:00.000Z"
  },
  "errors": []
}
```

---

### Get Upload Configuration

Get current upload configuration and limits.

**Endpoint:** `GET /upload/config`

**Authentication:** None required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Upload configuration retrieved successfully",
  "object": {
    "maxFileSize": 10485760,
    "maxFiles": 5,
    "allowedMimeTypes": ["image/jpeg", "image/png", "image/webp"],
    "generatedSizes": ["thumbnail", "medium", "large"],
    "supportedFormats": ["JPEG", "PNG", "WebP"],
    "outputFormat": "webp"
  },
  "errors": []
}
```

---

### Get Storage Statistics (Admin Only)

Get detailed storage statistics and usage information.

**Endpoint:** `GET /admin/storage/stats`

**Authentication:** Required (Admin role)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Storage statistics retrieved successfully",
  "object": {
    "totalFiles": 156,
    "totalSize": "45.2 MB",
    "directories": {
      "images": {
        "fileCount": 52,
        "totalSize": "25.8 MB"
      },
      "medium": {
        "fileCount": 52,
        "totalSize": "12.4 MB"
      },
      "thumbnails": {
        "fileCount": 52,
        "totalSize": "7.0 MB"
      }
    },
    "generatedAt": "2023-12-01T10:00:00.000Z"
  },
  "errors": []
}
```

---

### Cleanup Orphaned Images (Admin Only)

Remove images that are no longer associated with any products.

**Endpoint:** `POST /admin/storage/cleanup`

**Authentication:** Required (Admin role)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Storage cleanup completed successfully",
  "object": {
    "orphanedFiles": 12,
    "deletedFiles": 12,
    "freedSpace": "3.2 MB",
    "cleanupAt": "2023-12-01T10:00:00.000Z"
  },
  "errors": []
}
```

---

## Cache Management Endpoints

### Get Cache Statistics (Admin Only)

Retrieve detailed caching statistics and performance metrics.

**Endpoint:** `GET /products/cache/stats`

**Authentication:** Required (Admin role)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Cache statistics retrieved successfully",
  "object": {
    "statistics": {
      "enabled": true,
      "hits": 1247,
      "misses": 356,
      "hitRate": "77.8%",
      "sets": 356,
      "deletes": 89,
      "flushes": 2,
      "keys": 45,
      "ksize": 2048,
      "vsize": 1048576
    },
    "health": {
      "status": "healthy",
      "enabled": true,
      "operations": {
        "set": true,
        "get": true,
        "delete": true
      }
    },
    "configuration": {
      "enabled": true,
      "defaultTTL": 60,
      "productListTTL": 120,
      "productDetailTTL": 300,
      "searchTTL": 60,
      "maxKeys": 1000
    },
    "keys": {
      "total": 45,
      "sample": [
        "products:list:page:1:size:10",
        "products:detail:product-uuid-123",
        "products:list:page:1:size:10_search:iPhone"
      ]
    }
  },
  "errors": []
}
```

**Cache Metrics Explained:**
- **Hit Rate**: Percentage of requests served from cache
- **TTL Values**: Time-to-live in seconds for different cache types
- **Keys**: Current number of cached entries
- **Memory Usage**: Cache memory consumption (ksize + vsize)

---

### Flush Cache (Admin Only)

Clear all cached entries to force fresh data retrieval.

**Endpoint:** `DELETE /products/cache/flush`

**Authentication:** Required (Admin role)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Cache flushed successfully",
  "object": {
    "flushed": true,
    "timestamp": "2023-12-01T10:00:00.000Z"
  },
  "errors": []
}
```

**Use Cases:**
- Force refresh of all cached data
- Clear cache after bulk product updates
- Troubleshooting cache-related issues
- Maintenance operations

---

## Order Endpoints

### Place Order

Create a new order with multiple products.

**Endpoint:** `POST /orders`

**Authentication:** Required (User role)

**Request Body:**
```json
{
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
}
```

**Request Rules:**
- **Description**: Optional string, max 500 characters (auto-generated if not provided)
- **Products**: Array of products with productId and quantity
- **ProductId**: Valid product UUID, required
- **Quantity**: Positive integer, required

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "object": {
    "order_id": "order-uuid-789",
    "status": "pending",
    "total_price": 1199.98,
    "description": "Birthday gift for my friend - gaming setup",
    "userId": "user-uuid-123",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "products": [
      {
        "productId": "product-uuid-123",
        "name": "iPhone 15 Pro",
        "description": "Latest Apple smartphone",
        "quantity": 2,
        "price": 999.99,
        "itemTotal": 1999.98
      },
      {
        "productId": "product-uuid-456",
        "name": "AirPods Pro",
        "description": "Wireless earbuds with noise cancellation",
        "quantity": 1,
        "price": 249.99,
        "itemTotal": 249.99
      }
    ]
  },
  "errors": []
}
```

**Business Logic:**
- Stock validation and automatic updates
- Total price calculated on backend using database prices
- Database transactions ensure data consistency
- Auto-generated descriptions when not provided

**Error Responses:**
- **400 Bad Request**: Validation errors, insufficient stock, invalid description
- **401 Unauthorized**: Missing or invalid token
- **404 Not Found**: Product not found

---

### View Order History

Retrieve the authenticated user's order history.

**Endpoint:** `GET /orders`

**Authentication:** Required (User role)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Retrieved 2 orders successfully",
  "object": [
    {
      "order_id": "order-uuid-789",
      "status": "pending",
      "total_price": 1199.98,
      "created_at": "2023-12-01T10:00:00.000Z",
      "description": "Birthday gift for my friend - gaming setup",
      "products": [
        {
          "productId": "product-uuid-123",
          "name": "iPhone 15 Pro",
          "quantity": 2,
          "price": 999.99,
          "itemTotal": 1999.98
        }
      ]
    },
    {
      "order_id": "order-uuid-790",
      "status": "completed",
      "total_price": 2499.99,
      "created_at": "2023-11-30T15:30:00.000Z",
      "description": "Order for 1x MacBook Pro 16-inch",
      "products": [
        {
          "productId": "product-uuid-456",
          "name": "MacBook Pro 16-inch",
          "quantity": 1,
          "price": 2499.99,
          "itemTotal": 2499.99
        }
      ]
    }
  ],
  "errors": []
}
```

**Features:**
- Orders sorted by creation date (most recent first)
- User isolation (users only see their own orders)
- Includes created_at timestamp (Page 11 PDF requirement)
- Empty array returned if user has no orders

**Error Responses:**
- **401 Unauthorized**: Missing or invalid token

---

## Health Check

### API Health Status

Check if the API is running and healthy.

**Endpoint:** `GET /health`

**Authentication:** None required

**Success Response (200 OK):**
```json
{
  "status": "OK",
  "message": "E-commerce API is running",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "environment": "development"
}
```

---

### API Information

Get general information about the API.

**Endpoint:** `GET /`

**Authentication:** None required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "E-commerce RESTful API Backend",
  "version": "1.0.0",
  "endpoints": {
    "authentication": "/auth (POST /register, POST /login)",
    "products": "/products (GET, POST, PUT, DELETE)",
    "orders": "/orders (GET, POST)",
    "images": "/products/:id/image (POST, DELETE), /products/:id/images (POST)",
    "cache": "/products/cache/stats (GET), /products/cache/flush (DELETE)",
    "health": "/health"
  },
  "documentation": "See README.md for detailed API documentation"
}
```

---

# Data Models

## User Model
```json
{
  "id": "string (UUID)",
  "username": "string (alphanumeric, 3-30 chars)",
  "email": "string (valid email format)",
  "password": "string (hashed, never returned)",
  "role": "string (user|admin)",
  "createdAt": "string (ISO date)"
}
```

## Product Model
```json
{
  "id": "string (UUID)",
  "name": "string (3-100 chars)",
  "description": "string (min 10 chars)",
  "price": "number (positive)",
  "stock": "number (non-negative integer)",
  "category": "string (non-empty)",
  "userId": "string (UUID of creator)",
  "images": {
    "processedImages": {
      "thumbnail": {
        "path": "string (relative path to thumbnail)",
        "size": "string (dimensions)",
        "fileSize": "number (bytes)"
      },
      "medium": {
        "path": "string (relative path to medium image)",
        "size": "string (dimensions)",
        "fileSize": "number (bytes)"
      },
      "large": {
        "path": "string (relative path to large image)",
        "size": "string (dimensions)",
        "fileSize": "number (bytes)"
      }
    },
    "uploadInfo": {
      "originalFilename": "string",
      "processedAt": "string (ISO date)",
      "totalProcessedSizes": "number"
    }
  },
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

## Order Model
```json
{
  "id": "string (UUID)",
  "userId": "string (UUID)",
  "description": "string (max 500 chars)",
  "totalPrice": "number (calculated on backend)",
  "status": "string (pending|completed|cancelled)",
  "products": [
    {
      "productId": "string (UUID)",
      "name": "string",
      "description": "string",
      "quantity": "number (positive integer)",
      "price": "number (price at time of order)",
      "itemTotal": "number (quantity * price)"
    }
  ],
  "createdAt": "string (ISO date)"
}
```

---

# Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or validation errors |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions for the requested action |
| 404 | Not Found | Requested resource not found |
| 409 | Conflict | Resource already exists (duplicate) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error occurred |

---

# Examples

## Complete User Journey Example

### 1. Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe123",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 2. Login and get token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Browse products
```bash
curl -X GET "http://localhost:3000/products?search=iPhone&page=1&pageSize=5"
```

### 4. Place an order
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "My first order",
    "products": [
      {
        "productId": "product-uuid-123",
        "quantity": 1
      }
    ]
  }'
```

### 5. View order history
```bash
curl -X GET http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Admin Operations Example

### 1. Create a product (Admin only)
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "name": "New Product",
    "description": "This is a new product with detailed description",
    "price": 299.99,
    "stock": 50,
    "category": "Electronics"
  }'
```

### 2. Update product stock
```bash
curl -X PUT http://localhost:3000/products/product-uuid-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "stock": 75
  }'
```

---

## Testing the API

### Setup
1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Create admin user: `npm run setup-admin`
4. Start the server: `npm start`

### Available Test Scripts
```bash
# Run all integration tests
npm run test-api

# Test specific endpoints
npm run test-login
npm run test-create-product
npm run test-place-order
npm run test-view-order-history

# Test advanced features
npm run test-image-upload
npm run test-caching

# Test security features
npm run test-validation-security
npm run test-rate-limiting
npm run test-error-handling

# Run unit tests
npm run test:unit
npm run test:coverage
```

---

## Support

For questions, issues, or contributions:
- Check the test files for usage examples
- Review the source code for implementation details
- Run the test suite to verify functionality

**API Version:** 1.0.0  
**Last Updated:** December 2023