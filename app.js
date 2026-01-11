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
const imageRoutes = require('./src/routes/images');
const favoritesRoutes = require('./src/routes/favorites');

const app = express();

// Setup process handlers for uncaught exceptions and unhandled rejections
setupProcessHandlers();

// Apply rate limiting to all requests
app.use(generalLimiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow Netlify domains
    if (origin.includes('netlify.app') || origin.includes('netlify.com')) {
      return callback(null, true);
    }
    
    // Allow your custom domain if you have one
    // if (origin === 'https://yourdomain.com') {
    //   return callback(null, true);
    // }
    
    // For production, you might want to be more restrictive
    if (process.env.NODE_ENV === 'production') {
      // Add your specific frontend domains here
      const allowedOrigins = [
        'https://skillbridge-ecommerce.netlify.app', // Replace with your actual Netlify URL
        'https://your-custom-domain.com' // Add your custom domain if you have one
      ];
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For now, allow all origins in production (you can restrict this later)
      return callback(null, true);
    }
    
    // Allow all origins in development
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
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
app.use('/images', imageRoutes);
app.use('/favorites', favoritesRoutes);

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
      images: '/images (POST /products/:id/image, DELETE /products/:id/image)',
      favorites: '/favorites (GET, POST /:productId, DELETE /:productId)',
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