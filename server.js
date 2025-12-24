/**
 * E-commerce API Server
 * Production-ready server with comprehensive configuration
 * 
 * @author E-commerce API Team
 * @version 1.0.0
 * @since 2023-12-25
 */

const app = require('./app');
const { connect, disconnect } = require('./config/database');
const { config } = require('./config/environment');
const logger = require('./config/logger');

// Server instance for graceful shutdown
let server;

/**
 * Start the server with comprehensive error handling
 */
async function startServer() {
  try {
    logger.info('🚀 Starting E-commerce API Server...');
    logger.info(`📊 Environment: ${config.nodeEnv}`);
    logger.info(`🔌 Port: ${config.port}`);
    
    // Connect to database
    await connect();
    
    // Start HTTP server
    server = app.listen(config.port, () => {
      logger.info('🎉 Server started successfully!');
      logger.info(`🌐 Server running on: http://localhost:${config.port}`);
      logger.info(`❤️ Health check: http://localhost:${config.port}/health`);
      logger.info(`📚 API docs: http://localhost:${config.port}/`);
      
      // Log available endpoints
      logger.info('📋 Available endpoints:');
      logger.info('   • POST /auth/register - User registration');
      logger.info('   • POST /auth/login - User login');
      logger.info('   • GET  /products - Get all products');
      logger.info('   • POST /products - Create product (Admin)');
      logger.info('   • GET  /orders - Get user orders');
      logger.info('   • POST /orders - Create order');
      logger.info('   • POST /images/products/:id/image - Upload image (Admin)');
      
      logger.info('🔧 Server is ready to accept connections');
    });

    // Handle server errors
    server.on('error', handleServerError);

    return server;
  } catch (error) {
    logger.error('❌ Failed to start server:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

/**
 * Handle server startup errors
 * @param {Error} error - Server error
 */
function handleServerError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof config.port === 'string' ? 'Pipe ' + config.port : 'Port ' + config.port;

  switch (error.code) {
    case 'EACCES':
      logger.error(`❌ ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`❌ ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Graceful shutdown handler
 * @param {string} signal - Shutdown signal
 */
async function gracefulShutdown(signal) {
  logger.info(`📡 Received ${signal}. Starting graceful shutdown...`);
  
  const shutdownTimeout = setTimeout(() => {
    logger.error('❌ Graceful shutdown timeout. Forcing exit...');
    process.exit(1);
  }, 10000); // 10 second timeout

  try {
    // Close HTTP server
    if (server) {
      logger.info('🔒 Closing HTTP server...');
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      logger.info('✅ HTTP server closed');
    }

    // Close database connection
    logger.info('🔗 Closing database connection...');
    await disconnect();
    logger.info('✅ Database connection closed');

    clearTimeout(shutdownTimeout);
    logger.info('✅ Graceful shutdown completed');
    process.exit(0);

  } catch (error) {
    logger.error('❌ Error during graceful shutdown:', { error: error.message });
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

/**
 * Setup process handlers for uncaught exceptions and unhandled rejections
 */
function setupProcessHandlers() {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('💥 UNCAUGHT EXCEPTION! Shutting down...', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 UNHANDLED REJECTION! Shutting down...', {
      reason: reason,
      promise: promise
    });
    
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });

  // Graceful shutdown on various signals
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

  // Handle Windows specific signals
  if (process.platform === 'win32') {
    process.on('SIGBREAK', () => gracefulShutdown('SIGBREAK'));
  }
}

/**
 * Setup development mode enhancements
 */
function setupDevelopmentMode() {
  if (config.nodeEnv === 'development') {
    // Enable detailed error logging in development
    process.on('warning', (warning) => {
      logger.warn('⚠️ Warning:', {
        name: warning.name,
        message: warning.message,
        stack: warning.stack
      });
    });
  }
}

/**
 * Setup production mode enhancements
 */
function setupProductionMode() {
  if (config.nodeEnv === 'production') {
    // Set process title for easier identification
    process.title = 'ecommerce-api-server';
    
    // Log memory usage periodically in production
    setInterval(() => {
      const memUsage = process.memoryUsage();
      logger.info('📊 Memory Usage:', {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
      });
    }, 300000); // Every 5 minutes
  }
}

/**
 * Initialize and start the server
 */
async function initialize() {
  try {
    // Setup process handlers
    setupProcessHandlers();
    
    // Setup environment-specific configurations
    setupDevelopmentMode();
    setupProductionMode();
    
    // Start the server
    await startServer();
    
  } catch (error) {
    logger.error('💥 Fatal error during server initialization:', { error: error.message });
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  initialize();
}

// Export for testing and external use
module.exports = {
  server,
  startServer,
  gracefulShutdown,
  initialize
};