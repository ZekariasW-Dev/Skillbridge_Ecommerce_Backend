/**
 * Environment Configuration
 * Centralized environment variable management and validation
 * 
 * @author E-commerce API Team
 * @version 1.0.0
 * @since 2023-12-25
 */

const path = require('path');

class EnvironmentConfig {
  constructor() {
    this.loadEnvironment();
    this.validateEnvironment();
  }

  /**
   * Load environment variables
   */
  loadEnvironment() {
    // Load .env file in development
    if (process.env.NODE_ENV !== 'production') {
      require('dotenv').config();
    }
  }

  /**
   * Validate required environment variables
   */
  validateEnvironment() {
    const required = [
      'MONGODB_URI',
      'JWT_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing);
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate JWT secret strength
    if (process.env.JWT_SECRET.length < 32) {
      console.warn('⚠️ JWT_SECRET should be at least 32 characters for security');
    }

    console.log('✅ Environment validation completed');
  }

  /**
   * Get environment configuration
   * @returns {Object} Environment configuration
   */
  getConfig() {
    return {
      // Server configuration
      port: parseInt(process.env.PORT) || 3000,
      nodeEnv: process.env.NODE_ENV || 'development',
      
      // Database configuration
      mongoUri: process.env.MONGODB_URI,
      
      // Authentication configuration
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      
      // File upload configuration
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
      maxFiles: parseInt(process.env.MAX_FILES) || 5,
      
      // Cloudinary configuration (optional)
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
      },
      
      // Cache configuration
      cache: {
        ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
        maxKeys: parseInt(process.env.CACHE_MAX_KEYS) || 1000
      },
      
      // Rate limiting configuration
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 1000
      },
      
      // Logging configuration
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || path.join(__dirname, '../logs/app.log')
      }
    };
  }

  /**
   * Check if running in production
   * @returns {boolean} Is production environment
   */
  isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Check if running in development
   * @returns {boolean} Is development environment
   */
  isDevelopment() {
    return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  }

  /**
   * Check if running in test
   * @returns {boolean} Is test environment
   */
  isTest() {
    return process.env.NODE_ENV === 'test';
  }
}

// Export singleton instance
const environmentConfig = new EnvironmentConfig();

module.exports = {
  config: environmentConfig.getConfig(),
  isProduction: () => environmentConfig.isProduction(),
  isDevelopment: () => environmentConfig.isDevelopment(),
  isTest: () => environmentConfig.isTest()
};