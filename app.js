const express = require('express');
const cors = require('cors');
const { generalLimiter } = require('./src/middlewares/rateLimiter');
const { 
  globalErrorHandler, 
  notFoundHandler, 
  setupProcessHandlers 
} = require('./src/middlewares/errorHandler');

// Import routes
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');

const app = express();

// Setup process handlers for uncaught exceptions and unhandled rejections
setupProcessHandlers();

// Apply rate limiting to all requests
app.use(generalLimiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📝 ${timestamp} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
  });
}

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'E-commerce API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce RESTful API Backend',
    version: '1.0.0',
    endpoints: {
      authentication: '/auth (POST /register, POST /login)',
      products: '/products (GET, POST, PUT, DELETE)',
      orders: '/orders (GET, POST)',
      health: '/health'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Handle 404 errors for undefined routes
app.use('*', notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

module.exports = app;