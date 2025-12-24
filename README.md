# E-commerce Platform API

A comprehensive RESTful API backend for an E-commerce Platform built with Node.js and Express.js, featuring advanced search, image upload, caching, and security enhancements.

## 🚀 Features

### Core Functionality
- **User Authentication** - JWT-based registration/login with role-based access control
- **Product Management** - Complete CRUD operations with advanced search and filtering
- **Order Management** - Transaction-safe order processing with stock validation
- **Image Upload** - Multi-size image processing with WebP optimization
- **Advanced Search** - Multi-field search with category, price, and stock filtering

### Advanced Features
- **High-Performance Caching** - Intelligent caching with automatic invalidation
- **Multi-Tier Rate Limiting** - IP and user-based rate limiting with threat detection
- **Image Processing** - Automatic thumbnail, medium, and large size generation
- **Search Analytics** - Performance monitoring and usage analytics
- **Security Features** - Comprehensive input validation and error handling

### Technical Features
- **Standardized API Responses** - Consistent response format across all endpoints
- **Property-Based Testing** - Comprehensive test coverage with correctness properties
- **MongoDB Integration** - Optimized database queries with proper indexing
- **Production Ready** - Error handling, logging, and monitoring capabilities

## 🛠️ Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Atlas cloud hosting
- **JWT** - JSON Web Token for stateless authentication

### Security & Authentication
- **bcrypt** - Password hashing and salt generation
- **jsonwebtoken** - JWT token creation and verification
- **express-rate-limit** - Multi-tier rate limiting middleware
- **CORS** - Cross-origin resource sharing configuration

### Image Processing & Storage
- **Multer** - Multipart form data handling for file uploads
- **Sharp** - High-performance image processing and optimization
- **UUID** - Unique identifier generation for secure filenames

### Performance & Caching
- **node-cache** - In-memory caching with TTL support
- **MongoDB Indexes** - Optimized database queries for search and filtering

### Development & Testing
- **Jest** - JavaScript testing framework with property-based testing
- **Supertest** - HTTP assertion library for API testing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication endpoints
│   │   ├── productController.js  # Product CRUD operations
│   │   ├── orderController.js    # Order management
│   │   └── imageController.js    # Image upload and processing
│   ├── middlewares/
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── rateLimiter.js       # Multi-tier rate limiting
│   │   ├── cache.js             # Caching middleware
│   │   ├── upload.js            # File upload middleware
│   │   └── errorHandler.js     # Global error handling
│   ├── models/
│   │   ├── User.js              # User data model
│   │   ├── Product.js           # Product data model
│   │   └── Order.js             # Order data model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── products.js          # Product routes with caching
│   │   ├── orders.js            # Order routes
│   │   └── images.js            # Image upload routes
│   ├── services/
│   │   ├── cacheService.js      # Advanced caching service
│   │   └── imageService.js      # Image processing service
│   └── utils/
│       ├── helper.js            # Utility functions
│       ├── responses.js         # Standardized response helpers
│       └── validation.js       # Input validation utilities
├── docs/                        # API documentation
├── __tests__/                   # Test suites
├── uploads/                     # Image storage directory
├── app.js                       # Express application setup
├── server.js                    # Server startup
├── setup-admin.js              # Admin user creation script
└── README.md                   # This file
```

## ⚙️ Setup and Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB Atlas Account** (free tier available)

### 1. Clone the Repository
```bash
git clone https://github.com/ZekariasW-Dev/Skillbridge_Ecommerce_Backend.git
cd Skillbridge_Ecommerce_Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters

# Optional: Image Upload Configuration (uses defaults if not set)
MAX_FILE_SIZE=10485760
MAX_FILES=5
UPLOAD_PATH=uploads

# Optional: Cache Configuration (uses defaults if not set)
CACHE_TTL=300
CACHE_MAX_KEYS=1000
```

### 4. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account and cluster

2. **Configure Database Access**
   - Create a database user with read/write permissions
   - Add your IP address to the IP Access List

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string and update `MONGODB_URI` in `.env`

### 5. Create Admin User
```bash
npm run setup-admin
```
This creates an admin user with credentials:
- Email: `admin@example.com`
- Password: `AdminPass123!`

### 6. Start the Server

**Development Mode:**
```bash
npm start
# or
npm run dev
```

**Production Mode:**
```bash
NODE_ENV=production npm start
```

The API will be available at `http://localhost:3000`

### 7. Verify Installation
```bash
# Health check
curl http://localhost:3000/health

# API information
curl http://localhost:3000/
```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `3000` |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | `your_super_secure_jwt_secret_key_here` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `MAX_FILE_SIZE` | Maximum file upload size (bytes) | `10485760` (10MB) | `20971520` |
| `MAX_FILES` | Maximum files per upload | `5` | `10` |
| `UPLOAD_PATH` | Image storage directory | `uploads` | `storage/images` |
| `CACHE_TTL` | Default cache TTL (seconds) | `300` (5 min) | `600` |
| `CACHE_MAX_KEYS` | Maximum cache entries | `1000` | `5000` |

### Environment-Specific Configurations

**Development:**
```env
NODE_ENV=development
PORT=3000
# Shorter cache TTL for development
CACHE_TTL=60
```

**Production:**
```env
NODE_ENV=production
PORT=8080
# Longer cache TTL for production
CACHE_TTL=600
# Higher file size limits
MAX_FILE_SIZE=20971520
```

## 🏗️ Technology Choices Explained

### Why Node.js + Express.js?
- **Performance**: Non-blocking I/O perfect for API servers
- **JavaScript Ecosystem**: Vast npm package ecosystem
- **Rapid Development**: Fast prototyping and development cycles
- **Scalability**: Excellent for handling concurrent requests

### Why MongoDB?
- **Flexible Schema**: Easy to evolve data models
- **JSON-Native**: Natural fit for JavaScript applications
- **Atlas Cloud**: Managed service with automatic scaling
- **Aggregation Pipeline**: Powerful querying capabilities for search

### Why JWT Authentication?
- **Stateless**: No server-side session storage required
- **Scalable**: Works across multiple server instances
- **Standard**: Industry-standard authentication method
- **Flexible**: Easy to include user roles and permissions

### Why Sharp for Image Processing?
- **Performance**: Fastest image processing library for Node.js
- **Memory Efficient**: Processes images without loading entire files
- **Format Support**: Excellent WebP conversion and optimization
- **Resize Quality**: High-quality image resizing algorithms

### Why node-cache for Caching?
- **Simplicity**: Easy to implement and configure
- **Performance**: In-memory storage for fastest access
- **TTL Support**: Automatic expiration of cached data
- **Redis Migration**: Easy to upgrade to Redis for distributed caching

### Why Multi-Tier Rate Limiting?
- **Security**: Prevents abuse and DDoS attacks
- **Performance**: Protects server resources
- **User Experience**: Different limits for different user types
- **Flexibility**: Configurable limits per endpoint type

## 📚 API Documentation

### Quick Start Examples

#### Authentication
```bash
# Register new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe123",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Login user
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Products
```bash
# Get all products with search
curl "http://localhost:3000/products?search=laptop&page=1&pageSize=10"

# Create product (admin only)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1299.99,
    "stock": 10,
    "category": "Electronics"
  }'
```

#### Image Upload
```bash
# Upload product image (admin only)
curl -X POST http://localhost:3000/products/PRODUCT_ID/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@product-photo.jpg"
```

#### Orders
```bash
# Place order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "My order",
    "products": [
      {
        "productId": "PRODUCT_UUID",
        "quantity": 2
      }
    ]
  }'
```

### Complete API Documentation
- **Detailed API Docs**: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- **API Usage Guide**: [docs/API_USAGE_GUIDE.md](docs/API_USAGE_GUIDE.md)
- **OpenAPI Specification**: [docs/openapi.yaml](docs/openapi.yaml)
- **Postman Collection**: [docs/Ecommerce_API.postman_collection.json](docs/Ecommerce_API.postman_collection.json)

## 🧪 Testing

### Available Test Scripts
```bash
# Run all integration tests
npm run test-api

# Test specific functionality
npm run test-login
npm run test-create-product
npm run test-image-upload
npm run test-caching
npm run test-rate-limiting

# Run unit tests
npm run test:unit
npm run test:coverage
```

### Test Categories
- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end API testing
- **Property-Based Tests**: Correctness validation across input ranges
- **Performance Tests**: Response time and load testing
- **Security Tests**: Authentication and rate limiting validation

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with expiration
- **Password Hashing**: bcrypt with salt for secure password storage
- **Role-Based Access**: Admin and user role differentiation
- **Token Validation**: Comprehensive JWT verification

### Rate Limiting
- **Multi-Tier Limits**: Different limits for different endpoint types
- **IP-Based Limiting**: Protection against single-source attacks
- **User-Based Limiting**: Account-specific rate limits
- **Threat Detection**: Automatic blocking of suspicious activity

### Input Validation
- **Comprehensive Validation**: All inputs validated and sanitized
- **SQL Injection Prevention**: MongoDB query sanitization
- **XSS Protection**: Input encoding and validation
- **File Upload Security**: Type validation and secure storage

### Error Handling
- **Secure Error Messages**: No sensitive information exposure
- **Consistent Responses**: Standardized error format
- **Logging**: Comprehensive error logging for monitoring
- **Graceful Degradation**: Fallback mechanisms for failures

## 📊 Performance Features

### Caching Strategy
- **Multi-Level Caching**: Product lists, details, and search results
- **Intelligent Invalidation**: Automatic cache clearing on data changes
- **TTL Management**: Environment-specific cache expiration
- **Performance Monitoring**: Cache hit/miss ratio tracking

### Database Optimization
- **Indexes**: Optimized indexes for search and filtering
- **Aggregation Pipelines**: Efficient complex queries
- **Connection Pooling**: Optimized database connections
- **Query Optimization**: Minimized database round trips

### Image Optimization
- **Multi-Size Generation**: Thumbnail, medium, and large versions
- **WebP Conversion**: Modern format for optimal file sizes
- **Lazy Processing**: On-demand image processing
- **CDN Ready**: Static file serving optimization

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set secure JWT secret (32+ characters)
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Environment Variables for Production
```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://prod-user:secure-password@prod-cluster.mongodb.net/ecommerce
JWT_SECRET=your_production_jwt_secret_minimum_32_characters_long
MAX_FILE_SIZE=20971520
CACHE_TTL=600
```

## 📈 Monitoring & Analytics

### Available Endpoints
- **Health Check**: `GET /health` - Server status
- **Cache Statistics**: `GET /products/cache/stats` - Cache performance
- **Storage Statistics**: `GET /admin/storage/stats` - Image storage usage
- **Rate Limit Statistics**: Built into rate limiting headers

### Metrics Tracked
- **API Response Times**: Request processing performance
- **Cache Hit Rates**: Caching effectiveness
- **Rate Limit Usage**: Security and usage patterns
- **Error Rates**: System reliability metrics
- **Storage Usage**: Image storage consumption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [API Documentation](docs/API_DOCUMENTATION.md)
2. Review the test files for usage examples
3. Check the [Issues](https://github.com/ZekariasW-Dev/Skillbridge_Ecommerce_Backend/issues) page
4. Create a new issue with detailed information

## 🎯 Roadmap

Future enhancements planned:
- [ ] Advanced search and filtering implementation
- [ ] Enhanced security rate limiting
- [ ] Real-time notifications with WebSockets
- [ ] Payment gateway integration
- [ ] Inventory management system
- [ ] Analytics dashboard
- [ ] Multi-language support