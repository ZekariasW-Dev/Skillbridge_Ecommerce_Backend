# E-commerce Platform - SkillBridge

A comprehensive fullstack e-commerce platform built with Node.js/Express backend and React frontend.

## 🚀 Features

### Backend (Node.js/Express)
- ✅ User authentication (register/login) with JWT
- ✅ Admin role management
- ✅ Product CRUD operations
- ✅ Order management with transactions
- ✅ Search and pagination
- ✅ Image upload (Cloudinary)
- ✅ Rate limiting and caching
- ✅ Input validation and error handling
- ✅ MongoDB with proper indexing

### Frontend (React/Vite)
- ✅ Modern UI with Material-UI
- ✅ Authentication system
- ✅ Shopping cart functionality
- ✅ Admin dashboard
- ✅ Product management
- ✅ Order tracking
- ✅ Responsive design

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB with native driver
- JWT for authentication
- bcrypt for password hashing
- Cloudinary for image storage
- Rate limiting & caching

**Frontend:**
- React 18 with Vite
- Material-UI (MUI)
- React Router DOM
- Axios for API calls
- Context API for state management

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account (optional, for images)

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd ecommerce-platform
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 3. Environment Variables
Create `.env` file with:
```env
PORT=3000
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
NODE_ENV=development

# Optional - Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Setup Database & Admin
```bash
# Create admin user and sample products
node setup-admin-and-products.js
```

### 5. Start Backend
```bash
npm start
# Backend runs on http://localhost:3000
```

### 6. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3001
```

## 🔑 Admin Access

**Credentials:**
- Email: `admin@skillbridge.com`
- Password: `Admin123!`

**Admin Features:**
- Dashboard with statistics
- Add/Edit/Delete products
- View all orders
- Manage users

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Product Endpoints

#### Get All Products (Public)
```http
GET /products?page=1&limit=10&search=laptop
```

#### Get Product by ID (Public)
```http
GET /products/:id
```

#### Create Product (Admin Only)
```http
POST /products
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "stock": 50,
  "category": "electronics"
}
```

#### Update Product (Admin Only)
```http
PUT /products/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "price": 899.99,
  "stock": 45
}
```

#### Delete Product (Admin Only)
```http
DELETE /products/:id
Authorization: Bearer <jwt_token>
```

### Order Endpoints

#### Place Order (Authenticated)
```http
POST /orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "products": [
    {
      "productId": "product_id_here",
      "quantity": 2
    }
  ]
}
```

#### Get My Orders (Authenticated)
```http
GET /orders
Authorization: Bearer <jwt_token>
```

## 🧪 Testing

### Run All Tests
```bash
# Test backend functionality
node test-fullstack.js

# Test admin features
node test-admin-functionality.js
```

### Expected Test Results
```
✅ Backend is running
✅ Admin login successful
✅ Products API working: 6 products found
✅ Product creation successful
✅ Order placement successful
🎉 All tests passed!
```

## 📁 Project Structure

```
ecommerce-platform/
├── src/
│   ├── controllers/          # Route handlers
│   ├── models/              # Database models
│   ├── middlewares/         # Auth, validation, etc.
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   └── utils/               # Helper functions
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   └── services/        # API calls
│   └── public/              # Static assets
├── config/                  # Configuration files
├── docs/                    # API documentation
└── tests/                   # Test files
```

## 🔒 Security Features

- JWT authentication with secure tokens
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- Protected admin routes
- CORS configuration
- Environment variable protection

## 🚀 Deployment

### Backend (Render/Heroku)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Frontend (Netlify/Vercel)
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set API base URL environment variable

### Database (MongoDB Atlas)
1. Create cluster
2. Configure network access
3. Create database user
4. Get connection string

## 📊 Performance Features

- Database indexing for fast queries
- Response caching for product listings
- Pagination for large datasets
- Image optimization with Cloudinary
- Efficient MongoDB queries

## 🛡️ Error Handling

- Comprehensive error middleware
- Validation error responses
- Database error handling
- Authentication error management
- Rate limiting responses

## 📈 Monitoring

- Request logging
- Error tracking
- Performance metrics
- Health check endpoint
- Database connection monitoring

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
```

**Frontend:**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection:**
- Check connection string format
- Verify network access in Atlas
- Ensure correct credentials

**Authentication Issues:**
- Verify JWT secret is set
- Check token expiration
- Confirm user role permissions

**Frontend API Calls:**
- Check API base URL
- Verify CORS configuration
- Confirm backend is running

### Support

For issues and questions:
1. Check existing documentation
2. Run test scripts to diagnose
3. Check console logs for errors
4. Verify environment variables

---

Built with ❤️ for SkillBridge Assessment