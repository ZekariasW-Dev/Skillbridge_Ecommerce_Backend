const cacheService = require('../services/cacheService');

/**
 * Cache Middleware for Express Routes
 * 
 * Provides caching functionality for HTTP responses with automatic
 * cache key generation and response caching.
 */

/**
 * Generic cache middleware
 * @param {number} ttl - Time to live in seconds
 * @param {function} keyGenerator - Function to generate cache key from request
 * @returns {function} - Express middleware function
 */
const cacheMiddleware = (ttl, keyGenerator) => {
  return async (req, res, next) => {
    try {
      // Generate cache key
      const cacheKey = keyGenerator(req);
      
      // Try to get cached response
      const cachedResponse = cacheService.get(cacheKey);
      
      if (cachedResponse) {
        // Cache hit - return cached response
        console.log(`🚀 Cache hit for key: ${cacheKey}`);
        return res.status(cachedResponse.status).json(cachedResponse.data);
      }
      
      // Cache miss - continue to route handler
      console.log(`⏳ Cache miss for key: ${cacheKey}`);
      
      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response if it's successful
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseToCache = {
            status: res.statusCode,
            data: data
          };
          
          cacheService.set(cacheKey, responseToCache, ttl);
          console.log(`💾 Response cached for key: ${cacheKey}`);
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Cache middleware specifically for product listing
 * Handles pagination and search parameters
 */
const cacheProductList = cacheMiddleware(
  cacheService.getConfig().productListTTL,
  (req) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit || req.query.pageSize) || 10;
    const search = req.query.search || '';
    
    return cacheService.generateProductListKey(page, pageSize, search);
  }
);

/**
 * Cache middleware for product details
 */
const cacheProductDetail = cacheMiddleware(
  cacheService.getConfig().productDetailTTL,
  (req) => {
    const productId = req.params.id;
    return cacheService.generateProductDetailKey(productId);
  }
);

/**
 * Cache middleware for search results
 */
const cacheSearchResults = cacheMiddleware(
  cacheService.getConfig().searchTTL,
  (req) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit || req.query.pageSize) || 10;
    const search = req.query.search || '';
    
    // Use same key as product list since search is part of product listing
    return cacheService.generateProductListKey(page, pageSize, search);
  }
);

/**
 * Middleware to invalidate product cache after modifications
 * Should be used after product create, update, delete operations
 */
const invalidateProductCache = (req, res, next) => {
  // Store original res.json method
  const originalJson = res.json;
  
  // Override res.json to invalidate cache after successful operations
  res.json = function(data) {
    // Invalidate cache if operation was successful
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // For specific product operations, invalidate that product's detail cache
      if (req.params && req.params.id) {
        cacheService.invalidateProductDetail(req.params.id);
      }
      
      // Always invalidate product list cache for any product modification
      cacheService.invalidateProductCache();
      console.log('🗑️  Product cache invalidated after successful operation');
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Middleware to provide cache statistics endpoint
 */
const cacheStats = (req, res) => {
  const stats = cacheService.getStats();
  const health = cacheService.healthCheck();
  
  res.json({
    success: true,
    message: 'Cache statistics retrieved successfully',
    object: {
      statistics: stats,
      health: health,
      configuration: {
        enabled: cacheService.getConfig().enabled,
        defaultTTL: cacheService.getConfig().defaultTTL,
        productListTTL: cacheService.getConfig().productListTTL,
        productDetailTTL: cacheService.getConfig().productDetailTTL,
        searchTTL: cacheService.getConfig().searchTTL,
        maxKeys: cacheService.getConfig().maxKeys
      },
      keys: {
        total: cacheService.keys().length,
        sample: cacheService.keys().slice(0, 10) // Show first 10 keys as sample
      }
    }
  });
};

/**
 * Middleware to flush cache (admin only)
 */
const flushCache = (req, res) => {
  try {
    cacheService.flush();
    
    res.json({
      success: true,
      message: 'Cache flushed successfully',
      object: {
        flushed: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to flush cache',
      object: null,
      errors: [error.message]
    });
  }
};

/**
 * Custom cache middleware with configurable options
 * @param {object} options - Cache options
 * @param {number} options.ttl - Time to live in seconds
 * @param {string} options.keyPrefix - Prefix for cache key
 * @param {function} options.keyGenerator - Custom key generator function
 * @param {function} options.shouldCache - Function to determine if response should be cached
 * @returns {function} - Express middleware function
 */
const customCache = (options = {}) => {
  const {
    ttl = cacheService.getConfig().defaultTTL,
    keyPrefix = 'custom',
    keyGenerator = (req) => `${keyPrefix}:${req.originalUrl}`,
    shouldCache = (req, res) => res.statusCode >= 200 && res.statusCode < 300
  } = options;
  
  return cacheMiddleware(ttl, keyGenerator, shouldCache);
};

module.exports = {
  cacheMiddleware,
  cacheProductList,
  cacheProductDetail,
  cacheSearchResults,
  invalidateProductCache,
  cacheStats,
  flushCache,
  customCache,
  cacheService // Export service for direct access if needed
};