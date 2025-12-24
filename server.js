require('dotenv').config();

/**
 * Environment Variables Validation
 * Best Practice: Ensure all necessary secrets are available before starting the server
 */
const validateEnvironment = () => {
  console.log('🔍 Validating environment variables...');
  
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  const optionalEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET',
    'PORT',
    'NODE_ENV'
  ];

  const missingRequired = [];
  const missingOptional = [];
  const presentVars = [];

  // Check required environment variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName] || process.env[varName].trim() === '') {
      missingRequired.push(varName);
    } else {
      presentVars.push(varName);
    }
  });

  // Check optional environment variables
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName] || process.env[varName].trim() === '') {
      missingOptional.push(varName);
    } else {
      presentVars.push(varName);
    }
  });

  // Log validation results
  console.log(`✅ Present variables (${presentVars.length}):`, presentVars.join(', '));
  
  if (missingOptional.length > 0) {
    console.log(`⚠️  Optional missing (${missingOptional.length}):`, missingOptional.join(', '));
  }

  // Handle missing required variables
  if (missingRequired.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingRequired.forEach(varName => {
      console.error(`   • ${varName}`);
    });
    console.error('\n💡 Please check your .env file and ensure all required variables are set.');
    console.error('📋 Required variables:');
    requiredEnvVars.forEach(varName => {
      console.error(`   • ${varName} - ${getEnvVarDescription(varName)}`);
    });
    process.exit(1);
  }

  // Validate specific environment variable formats
  validateSpecificEnvVars();

  console.log('✅ Environment validation completed successfully');
};

/**
 * Get description for environment variables
 */
const getEnvVarDescription = (varName) => {
  const descriptions = {
    'MONGODB_URI': 'MongoDB connection string',
    'JWT_SECRET': 'JWT signing secret (should be strong and unique)',
    'CLOUDINARY_CLOUD_NAME': 'Cloudinary cloud name for image uploads',
    'CLOUDINARY_API_KEY': 'Cloudinary API key',
    'CLOUDINARY_API_SECRET': 'Cloudinary API secret',
    'PORT': 'Server port number',
    'NODE_ENV': 'Node environment (development/production)'
  };
  return descriptions[varName] || 'Environment variable';
};

/**
 * Validate specific environment variable formats and values
 */
const validateSpecificEnvVars = () => {
  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long for security');
  }

  // Validate MONGODB_URI format
  if (process.env.MONGODB_URI) {
    if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      console.error('❌ MONGODB_URI must start with mongodb:// or mongodb+srv://');
      process.exit(1);
    }
  }

  // Validate PORT if provided
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error('❌ PORT must be a valid number between 1 and 65535');
      process.exit(1);
    }
  }

  // Validate NODE_ENV if provided
  if (process.env.NODE_ENV) {
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(process.env.NODE_ENV)) {
      console.warn(`⚠️  NODE_ENV should be one of: ${validEnvs.join(', ')}`);
    }
  }

  // Check Cloudinary configuration completeness
  const cloudinaryVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const cloudinaryPresent = cloudinaryVars.filter(varName => process.env[varName]);
  
  if (cloudinaryPresent.length > 0 && cloudinaryPresent.length < 3) {
    console.warn('⚠️  Partial Cloudinary configuration detected. For image uploads to work, all Cloudinary variables are needed:');
    cloudinaryVars.forEach(varName => {
      const status = process.env[varName] ? '✅' : '❌';
      console.warn(`   ${status} ${varName}`);
    });
  }
};

// Validate environment before proceeding
validateEnvironment();

const app = require('./app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Server instance reference for graceful shutdown
let server;

/**
 * Enhanced server startup with comprehensive error handling
 */
const startServer = async () => {
  try {
    console.log('🚀 Starting E-commerce API Server...');
    console.log(`📊 Environment: ${NODE_ENV}`);
    console.log(`🔌 Port: ${PORT}`);
    console.log('🔒 Environment validation: ✅ Passed');
    
    // Initialize database connection
    console.log('🔗 Connecting to database...');
    await db.connect();
    console.log('✅ Database connected successfully');
    
    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log('\n🎉 Server started successfully!');
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/`);
      console.log('\n📋 Available endpoints:');
      console.log('   • POST /auth/register - User registration');
      console.log('   • POST /auth/login - User login');
      console.log('   • GET  /products - Get all products');
      console.log('   • POST /products - Create product (Admin)');
      console.log('   • GET  /orders - Get user orders');
      console.log('   • POST /orders - Create order');
      console.log('\n🔧 Server is ready to accept connections');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('📋 Error details:', error);
    
    // Attempt to close database connection if it was opened
    try {
      await db.close();
      console.log('🔌 Database connection closed');
    } catch (dbError) {
      console.error('❌ Error closing database:', dbError.message);
    }
    
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  const shutdownTimeout = setTimeout(() => {
    console.error('❌ Graceful shutdown timeout. Forcing exit...');
    process.exit(1);
  }, 10000); // 10 second timeout

  try {
    // Close HTTP server
    if (server) {
      console.log('🔌 Closing HTTP server...');
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('✅ HTTP server closed');
    }

    // Close database connection
    console.log('🔗 Closing database connection...');
    await db.close();
    console.log('✅ Database connection closed');

    clearTimeout(shutdownTimeout);
    console.log('✅ Graceful shutdown completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error.message);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

/**
 * Global error handlers for uncaught exceptions and unhandled rejections
 */
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Close server gracefully
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  
  // Close server gracefully
  if (server) {
    server.close(() => {
      process.exit(1);
    });
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

/**
 * Development mode enhancements
 */
if (NODE_ENV === 'development') {
  // Enable detailed error logging in development
  process.on('warning', (warning) => {
    console.warn('⚠️  Warning:', warning.name);
    console.warn('Message:', warning.message);
    console.warn('Stack:', warning.stack);
  });
}

/**
 * Production mode enhancements
 */
if (NODE_ENV === 'production') {
  // Set process title for easier identification
  process.title = 'ecommerce-api-server';
  
  // Log memory usage periodically in production
  setInterval(() => {
    const memUsage = process.memoryUsage();
    console.log('📊 Memory Usage:', {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
    });
  }, 300000); // Every 5 minutes
}

// Start the server
startServer().catch((error) => {
  console.error('💥 Fatal error during server startup:', error);
  process.exit(1);
});

// Export server instance for testing
module.exports = { server, startServer, gracefulShutdown };