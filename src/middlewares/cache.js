const cacheService = require('../services/cacheService');

/**
 * Cache Middleware for Express Routes
 * 
 * Provides caching functionality for HTTP responses with automatic
 * cache key generation and response caching.
 */

// Cache configuration constants
const CACHE_CONFIG = {
  productListTTL: 300, // 5 minutes
  productDetailTTL: 600, // 10 minutes
  searchTTL: 180, // 3 minutes
  defaultTTL: 300, // 5 minutes
  enabled: process.env.CACHE_ENABLED !== 'false'
};

/**
 * Generic cache middleware
 * @param {string} cacheType - Type of cache to use (products, productLists, etc.)
 * @param {number} ttl - Time to live in seconds
 * @param {function} keyGenerator - Function to generate cache key from request
 * @returns {function} - Express middleware function
 */
const cacheMiddleware = (cacheType, ttl, keyGenerator) => {
  return async (req, res, next) => {
    try {
      if (!CACHE_CONFIG.enabled) {
        return next();
      }

      // Generate cache key
      const cacheKey = keyGenerator(req);
      
      // Try to get cached response
      const cachedResponse = cacheService.get(cacheType, cacheKey);
      
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
          
          cacheService.set(cacheType, cacheKey, responseToCache, ttl);
          console.log(`💾 Response cached for key: ${cacheKey}`);
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching on error - prevent server from stopping
      next();
    }
  };
};

/**
 * Cache middleware specifically for product listing
 * Handles pagination and search parameters
 */
const cacheProductList = cacheMiddleware(
  'productLists',
  CACHE_CONFIG.productListTTL,
  (req) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit || req.query.pageSize) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sort = req.query.sort || '';
    
    return cacheService.generateKey('products', 'list', {
      page,
      pageSize,
      ...(search && { search }),
      ...(category && { category }),
      ...(sort && { sort })
    });
  }
);

/**
 * Cache middleware for product details
 */
const cacheProductDetail = cacheMiddleware(
  'products',
  CACHE_CONFIG.productDetailTTL,
  (req) => {
    const productId = req.params.id;
    return cacheService.generateProductDetailKey(productId);
  }
);

/**
 * Cache middleware for search results
 */
const cacheSearchResults = cacheMiddleware(
  'productLists',
  CACHE_CONFIG.searchTTL,
  (req) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit || req.query.pageSize) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sort = req.query.sort || '';
    
    return cacheService.generateKey('products', 'list', {
      page,
      pageSize,
      ...(search && { search }),
      ...(category && { category }),
      ...(sort && { sort })
    });
  }
);

/**
 * Middleware to invalidate product cache after modifications
 * Should be used after product create, update, delete operations
 */
const invalidateProductCache = (req, res, next) => {
  try {
    // Store original res.json method
    const originalJson = res.json;
    
    // Override res.json to invalidate cache after successful operations
    res.json = function(data) {
      try {
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
      } catch (error) {
        console.error('Cache invalidation error:', error);
        // Don't let cache errors stop the response
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Cache invalidation middleware error:', error);
    // Continue without cache invalidation on error
    next();
  }
};

/**
 * Middleware to provide cache statistics endpoint
 */
const cacheStats = (req, res) => {
  try {
    const stats = cacheService.getStats();
    
    res.json({
      success: true,
      message: 'Cache statistics retrieved successfully',
      object: {
        statistics: stats,
        configuration: {
          enabled: CACHE_CONFIG.enabled,
          defaultTTL: CACHE_CONFIG.defaultTTL,
          productListTTL: CACHE_CONFIG.productListTTL,
          productDetailTTL: CACHE_CONFIG.productDetailTTL,
          searchTTL: CACHE_CONFIG.searchTTL
        },
        cacheTypes: Object.keys(cacheService.caches || {}),
        uptime: stats ? stats.uptime : 0
      }
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cache statistics',
      object: null,
      errors: [error.message]
    });
  }
};

/**
 * Middleware to flush cache (admin only)
 */
const flushCache = (req, res) => {
  try {
    const flushed = cacheService.flush();
    
    res.json({
      success: true,
      message: 'Cache flushed successfully',
      object: {
        flushed: flushed,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Cache flush error:', error);
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
 * @param {string} options.cacheType - Type of cache to use
 * @param {number} options.ttl - Time to live in seconds
 * @param {string} options.keyPrefix - Prefix for cache key
 * @param {function} options.keyGenerator - Custom key generator function
 * @returns {function} - Express middleware function
 */
const customCache = (options = {}) => {
  const {
    cacheType = 'responses',
    ttl = CACHE_CONFIG.defaultTTL,
    keyPrefix = 'custom',
    keyGenerator = (req) => `${keyPrefix}:${req.originalUrl}`
  } = options;
  
  return cacheMiddleware(cacheType, ttl, keyGenerator);
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