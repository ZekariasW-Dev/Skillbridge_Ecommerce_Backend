const NodeCache = require('node-cache');

/**
 * Cache Service for E-commerce API
 * 
 * Provides in-memory caching functionality with TTL (Time To Live) support.
 * Can be easily upgraded to Redis for production environments.
 * 
 * Features:
 * - In-memory caching with automatic expiration
 * - Cache invalidation by key patterns
 * - Statistics and monitoring
 * - Environment-based configuration
 * - Easy Redis migration path
 */

class CacheService {
  constructor() {
    // Cache configuration based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test';
    
    // Cache settings
    this.config = {
      // TTL in seconds
      defaultTTL: isProduction ? 300 : 60, // 5 minutes in prod, 1 minute in dev
      productListTTL: isProduction ? 600 : 120, // 10 minutes in prod, 2 minutes in dev
      productDetailTTL: isProduction ? 1800 : 300, // 30 minutes in prod, 5 minutes in dev
      searchTTL: isProduction ? 180 : 60, // 3 minutes in prod, 1 minute in dev
      
      // Cache size limits
      maxKeys: isProduction ? 10000 : 1000,
      
      // Check period for expired keys (in seconds)
      checkPeriod: isProduction ? 120 : 60,
      
      // Disable cache in test environment
      enabled: !isTest
    };
    
    // Initialize cache instance
    this.cache = new NodeCache({
      stdTTL: this.config.defaultTTL,
      maxKeys: this.config.maxKeys,
      checkperiod: this.config.checkPeriod,
      useClones: false, // Better performance, but be careful with object mutations
      deleteOnExpire: true,
      enableLegacyCallbacks: false
    });
    
    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      flushes: 0
    };
    
    // Setup event listeners for monitoring
    this.setupEventListeners();
    
    console.log(`🗄️  Cache Service initialized (${isTest ? 'DISABLED' : 'ENABLED'})`);
    if (this.config.enabled) {
      console.log(`   - Default TTL: ${this.config.defaultTTL}s`);
      console.log(`   - Max Keys: ${this.config.maxKeys}`);
      console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
    }
  }
  
  /**
   * Setup event listeners for cache monitoring
   */
  setupEventListeners() {
    this.cache.on('set', (key, value) => {
      this.stats.sets++;
    });
    
    this.cache.on('del', (key, value) => {
      this.stats.deletes++;
    });
    
    this.cache.on('expired', (key, value) => {
      console.log(`🗄️  Cache key expired: ${key}`);
    });
    
    this.cache.on('flush', () => {
      this.stats.flushes++;
      console.log('🗄️  Cache flushed');
    });
  }
  
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found
   */
  get(key) {
    if (!this.config.enabled) return null;
    
    const value = this.cache.get(key);
    
    if (value !== undefined) {
      this.stats.hits++;
      console.log(`🗄️  Cache HIT: ${key}`);
      return value;
    } else {
      this.stats.misses++;
      console.log(`🗄️  Cache MISS: ${key}`);
      return null;
    }
  }
  
  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {boolean} - Success status
   */
  set(key, value, ttl = null) {
    if (!this.config.enabled) return false;
    
    const success = this.cache.set(key, value, ttl || this.config.defaultTTL);
    
    if (success) {
      console.log(`🗄️  Cache SET: ${key} (TTL: ${ttl || this.config.defaultTTL}s)`);
    } else {
      console.error(`🗄️  Cache SET FAILED: ${key}`);
    }
    
    return success;
  }
  
  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {number} - Number of deleted keys
   */
  delete(key) {
    if (!this.config.enabled) return 0;
    
    const deleted = this.cache.del(key);
    console.log(`🗄️  Cache DELETE: ${key} (${deleted} keys deleted)`);
    return deleted;
  }
  
  /**
   * Delete multiple keys from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {number} - Number of deleted keys
   */
  deleteMultiple(keys) {
    if (!this.config.enabled) return 0;
    
    const deleted = this.cache.del(keys);
    console.log(`🗄️  Cache DELETE MULTIPLE: ${keys.length} keys (${deleted} deleted)`);
    return deleted;
  }
  
  /**
   * Delete keys matching a pattern
   * @param {string} pattern - Pattern to match (supports wildcards)
   * @returns {number} - Number of deleted keys
   */
  deletePattern(pattern) {
    if (!this.config.enabled) return 0;
    
    const keys = this.cache.keys();
    const matchingKeys = keys.filter(key => {
      // Convert pattern to regex (simple wildcard support)
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(key);
    });
    
    if (matchingKeys.length > 0) {
      const deleted = this.cache.del(matchingKeys);
      console.log(`🗄️  Cache DELETE PATTERN: ${pattern} (${deleted} keys deleted)`);
      return deleted;
    }
    
    return 0;
  }
  
  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} - True if key exists
   */
  has(key) {
    if (!this.config.enabled) return false;
    return this.cache.has(key);
  }
  
  /**
   * Get cache statistics
   * @returns {object} - Cache statistics
   */
  getStats() {
    const cacheStats = this.cache.getStats();
    
    return {
      enabled: this.config.enabled,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%'
        : '0%',
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      flushes: this.stats.flushes,
      keys: cacheStats.keys,
      ksize: cacheStats.ksize,
      vsize: cacheStats.vsize
    };
  }
  
  /**
   * Flush all cache entries
   */
  flush() {
    if (!this.config.enabled) return;
    
    this.cache.flushAll();
    console.log('🗄️  Cache flushed all entries');
  }
  
  /**
   * Get all cache keys
   * @returns {string[]} - Array of cache keys
   */
  keys() {
    if (!this.config.enabled) return [];
    return this.cache.keys();
  }
  
  /**
   * Generate cache key for product listing
   * @param {number} page - Page number
   * @param {number} pageSize - Page size
   * @param {string} search - Search query
   * @returns {string} - Cache key
   */
  generateProductListKey(page, pageSize, search) {
    const searchPart = search ? `_search:${search}` : '';
    return `products:list:page:${page}:size:${pageSize}${searchPart}`;
  }
  
  /**
   * Generate cache key for product details
   * @param {string} productId - Product ID
   * @returns {string} - Cache key
   */
  generateProductDetailKey(productId) {
    return `products:detail:${productId}`;
  }
  
  /**
   * Invalidate product-related cache entries
   * This should be called when products are created, updated, or deleted
   */
  invalidateProductCache() {
    if (!this.config.enabled) return;
    
    // Delete all product listing cache entries
    const listDeleted = this.deletePattern('products:list:*');
    
    // Delete all product detail cache entries
    const detailDeleted = this.deletePattern('products:detail:*');
    
    console.log(`🗄️  Product cache invalidated (${listDeleted + detailDeleted} keys deleted)`);
    return listDeleted + detailDeleted;
  }
  
  /**
   * Invalidate specific product detail cache
   * @param {string} productId - Product ID
   */
  invalidateProductDetail(productId) {
    if (!this.config.enabled) return;
    
    const key = this.generateProductDetailKey(productId);
    this.delete(key);
  }
  
  /**
   * Get cache configuration
   * @returns {object} - Cache configuration
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * Health check for cache service
   * @returns {object} - Health status
   */
  healthCheck() {
    try {
      // Test cache operations
      const testKey = 'health:check:' + Date.now();
      const testValue = { test: true, timestamp: Date.now() };
      
      // Test set
      const setResult = this.set(testKey, testValue, 1);
      
      // Test get
      const getValue = this.get(testKey);
      
      // Test delete
      const deleteResult = this.delete(testKey);
      
      const isHealthy = setResult && getValue !== null && deleteResult > 0;
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        enabled: this.config.enabled,
        operations: {
          set: setResult,
          get: getValue !== null,
          delete: deleteResult > 0
        },
        stats: this.getStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        enabled: this.config.enabled,
        error: error.message,
        stats: this.getStats()
      };
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;