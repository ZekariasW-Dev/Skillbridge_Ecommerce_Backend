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
    console.log(`🌐 CORS request from origin: ${origin}`);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('✅ Allowing localhost origin');
      return callback(null, true);
    }
    
    // Allow Netlify domains (any subdomain of netlify.app or netlify.com)
    if (origin.includes('netlify.app') || origin.includes('netlify.com')) {
      console.log('✅ Allowing Netlify origin');
      return callback(null, true);
    }
    
    // Allow Vercel domains (in case you switch platforms)
    if (origin.includes('vercel.app')) {
      console.log('✅ Allowing Vercel origin');
      return callback(null, true);
    }
    
    // Allow your custom domain if you have one
    // if (origin === 'https://yourdomain.com') {
    //   console.log('✅ Allowing custom domain');
    //   return callback(null, true);
    // }
    
    // For production, be more permissive for now (you can restrict later)
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ Allowing all origins in production (for now)');
      return callback(null, true);
    }
    
    // Allow all origins in development
    console.log('✅ Allowing all origins in development');
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
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

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working correctly!',
    origin: req.headers.origin || 'No origin header',
    timestamp: new Date().toISOString(),
    headers: {
      'user-agent': req.headers['user-agent'],
      'referer': req.headers.referer || 'No referer'
    }
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