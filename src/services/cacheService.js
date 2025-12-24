const NodeCache = require('node-cache');
const crypto = require('crypto');

/**
 * Advanced Caching Service for E-commerce API
 * 
 * Features:
 * - Multi-tier caching with different TTL strategies
 * - Cache invalidation patterns and tags
 * - Performance monitoring and statistics
 * - Memory usage optimization
 * - Cache warming and preloading
 * - Distributed cache support preparation
 */

class CacheService {
  constructor() {
    // Environment configuration
    const isProduction = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test';
    
    // Initialize multiple cache instances for different data types
    this.caches = {
      // Product cache - longer TTL for relatively static data
      products: new NodeCache({
        stdTTL: isProduction ? 600 : 300, // 10 minutes in prod, 5 minutes in dev
        checkperiod: 60,
        useClones: false,
        maxKeys: 1000,
        deleteOnExpire: true
      }),
      
      // Product lists and search results - shorter TTL due to frequent updates
      productLists: new NodeCache({
        stdTTL: isProduction ? 300 : 120, // 5 minutes in prod, 2 minutes in dev
        checkperiod: 30,
        useClones: false,
        maxKeys: 500,
        deleteOnExpire: true
      }),
      
      // User sessions and auth data - medium TTL
      sessions: new NodeCache({
        stdTTL: isProduction ? 1800 : 900, // 30 minutes in prod, 15 minutes in dev
        checkperiod: 120,
        useClones: false,
        maxKeys: 2000,
        deleteOnExpire: true
      }),
      
      // Configuration and static data - very long TTL
      config: new NodeCache({
        stdTTL: isProduction ? 3600 : 1800, // 1 hour in prod, 30 minutes in dev
        checkperiod: 300,
        useClones: false,
        maxKeys: 100,
        deleteOnExpire: true
      }),
      
      // API responses cache - short TTL for dynamic content
      responses: new NodeCache({
        stdTTL: isProduction ? 180 : 60, // 3 minutes in prod, 1 minute in dev
        checkperiod: 30,
        useClones: false,
        maxKeys: 1500,
        deleteOnExpire: true
      })
    };
    
    // Cache configuration
    this.config = {
      enabled: process.env.CACHE_ENABLED !== 'false',
      environment: process.env.NODE_ENV || 'development',
      isProduction,
      isTest
    };
    
    // Performance statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      flushes: 0,
      errors: 0,
      startTime: Date.now()
    };
    
    // Tag-based invalidation system
    this.tags = new Map();
    
    // Setup event listeners for monitoring
    this.setupEventListeners();
    
    // Initialize cache warming
    this.initializeCacheWarming();
    
    console.log(`🗄️  Advanced Cache Service initialized (${this.config.enabled ? 'ENABLED' : 'DISABLED'})`);
    if (this.config.enabled) {
      console.log(`   - Environment: ${this.config.environment}`);
      console.log(`   - Cache Types: ${Object.keys(this.caches).length}`);
      console.log(`   - Total Max Keys: ${Object.values(this.caches).reduce((sum, cache) => sum + cache.options.maxKeys, 0)}`);
    }
  }

  /**
   * Setup event listeners for cache monitoring
   */
  setupEventListeners() {
    Object.entries(this.caches).forEach(([cacheName, cache]) => {
      cache.on('set', () => {
        this.stats.sets++;
        this.logCacheOperation('SET', cacheName);
      });
      
      cache.on('del', () => {
        this.stats.deletes++;
        this.logCacheOperation('DELETE', cacheName);
      });
      
      cache.on('expired', (key) => {
        this.logCacheOperation('EXPIRED', cacheName, key);
      });
      
      cache.on('flush', () => {
        this.stats.flushes++;
        this.logCacheOperation('FLUSH', cacheName);
      });
    });
  }

  /**
   * Log cache operations (development mode only)
   */
  logCacheOperation(operation, cacheName, key = '') {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`🗄️  [${timestamp}] Cache ${operation}: ${cacheName}${key ? `:${key}` : ''}`);
    }
  }

  /**
   * Generate cache key with optional namespace and parameters
   */
  generateKey(namespace, identifier, params = {}) {
    const baseKey = `${namespace}:${identifier}`;
    
    if (Object.keys(params).length === 0) {
      return baseKey;
    }
    
    // Sort parameters for consistent key generation
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    // Hash long parameter strings to avoid key length issues
    if (sortedParams.length > 100) {
      const hash = crypto.createHash('md5').update(sortedParams).digest('hex');
      return `${baseKey}:${hash}`;
    }
    
    return `${baseKey}:${sortedParams}`;
  }

  /**
   * Get value from cache
   */
  get(cacheType, key) {
    if (!this.config.enabled) return null;
    
    try {
      const cache = this.caches[cacheType];
      if (!cache) {
        throw new Error(`Invalid cache type: ${cacheType}`);
      }
      
      const value = cache.get(key);
      
      if (value !== undefined) {
        this.stats.hits++;
        this.logCacheOperation('HIT', cacheType, key);
        return value;
      } else {
        this.stats.misses++;
        this.logCacheOperation('MISS', cacheType, key);
        return null;
      }
    } catch (error) {
      this.stats.errors++;
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL and tags
   */
  set(cacheType, key, value, ttl = null, tags = []) {
    if (!this.config.enabled) return false;
    
    try {
      const cache = this.caches[cacheType];
      if (!cache) {
        throw new Error(`Invalid cache type: ${cacheType}`);
      }
      
      // Set with custom TTL if provided
      const success = ttl ? cache.set(key, value, ttl) : cache.set(key, value);
      
      if (success) {
        // Associate tags with this cache entry
        tags.forEach(tag => {
          if (!this.tags.has(tag)) {
            this.tags.set(tag, new Set());
          }
          this.tags.get(tag).add({ cacheType, key });
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  delete(cacheType, key) {
    if (!this.config.enabled) return false;
    
    try {
      const cache = this.caches[cacheType];
      if (!cache) {
        throw new Error(`Invalid cache type: ${cacheType}`);
      }
      
      const deleted = cache.del(key);
      
      // Remove from tag associations
      this.tags.forEach((entries) => {
        entries.forEach(entry => {
          if (entry.cacheType === cacheType && entry.key === key) {
            entries.delete(entry);
          }
        });
      });
      
      return deleted > 0;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache entries by tag
   */
  invalidateByTag(tag) {
    if (!this.config.enabled) return 0;
    
    try {
      const entries = this.tags.get(tag);
      if (!entries) {
        return 0;
      }
      
      let deletedCount = 0;
      entries.forEach(entry => {
        if (this.delete(entry.cacheType, entry.key)) {
          deletedCount++;
        }
      });
      
      // Clear the tag
      this.tags.delete(tag);
      
      console.log(`🗄️  Invalidated ${deletedCount} cache entries by tag: ${tag}`);
      return deletedCount;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache invalidate by tag error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache or specific cache type
   */
  flush(cacheType = null) {
    if (!this.config.enabled) return false;
    
    try {
      if (cacheType) {
        const cache = this.caches[cacheType];
        if (cache) {
          cache.flushAll();
          console.log(`🗄️  Flushed ${cacheType} cache`);
          return true;
        }
        return false;
      } else {
        // Clear all caches
        Object.entries(this.caches).forEach(([name, cache]) => {
          cache.flushAll();
        });
        this.tags.clear();
        console.log('🗄️  Flushed all caches');
        return true;
      }
    } catch (error) {
      this.stats.errors++;
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats() {
    try {
      const stats = {
        global: { ...this.stats },
        caches: {},
        memory: {
          totalKeys: 0,
          totalSize: 0
        },
        hitRate: 0,
        uptime: Date.now() - this.stats.startTime
      };
      
      Object.entries(this.caches).forEach(([cacheName, cache]) => {
        const cacheStats = cache.getStats();
        stats.caches[cacheName] = {
          keys: cacheStats.keys,
          hits: cacheStats.hits,
          misses: cacheStats.misses,
          ksize: cacheStats.ksize,
          vsize: cacheStats.vsize,
          hitRate: cacheStats.hits > 0 ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2) : 0
        };
        
        stats.memory.totalKeys += cacheStats.keys;
        stats.memory.totalSize += cacheStats.vsize;
      });
      
      // Calculate global hit rate
      const totalHits = this.stats.hits;
      const totalRequests = this.stats.hits + this.stats.misses;
      stats.hitRate = totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) : 0;
      
      return stats;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache get stats error:', error);
      return null;
    }
  }

  /**
   * Initialize cache warming for frequently accessed data
   */
  initializeCacheWarming() {
    if (this.config.isProduction && this.config.enabled) {
      // Set up periodic cache warming
      setInterval(() => {
        this.warmCache();
      }, 300000); // Every 5 minutes
    }
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache() {
    if (!this.config.enabled) return;
    
    try {
      console.log('🔥 Cache warming initiated...');
      
      // Pre-load configuration
      this.set('config', 'app_settings', {
        maxFileSize: 10 * 1024 * 1024,
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        cacheEnabled: true,
        environment: this.config.environment
      }, 3600); // 1 hour TTL
      
      console.log('🔥 Cache warming completed');
      
    } catch (error) {
      console.error('Cache warming error:', error);
    }
  }

  // Legacy methods for backward compatibility
  
  /**
   * Legacy get method (uses 'responses' cache by default)
   */
  legacyGet(key) {
    return this.get('responses', key);
  }

  /**
   * Legacy set method (uses 'responses' cache by default)
   */
  legacySet(key, value, ttl = null) {
    return this.set('responses', key, value, ttl);
  }

  /**
   * Legacy delete method (uses 'responses' cache by default)
   */
  legacyDelete(key) {
    return this.delete('responses', key);
  }

  /**
   * Generate cache key for product listing
   */
  generateProductListKey(page, pageSize, search, category, sortBy, sortOrder) {
    const params = {
      page: page || 1,
      pageSize: pageSize || 10,
      ...(search && { search }),
      ...(category && { category }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder })
    };
    
    return this.generateKey('products', 'list', params);
  }

  /**
   * Generate cache key for product details
   */
  generateProductDetailKey(productId) {
    return this.generateKey('products', 'detail', { id: productId });
  }

  /**
   * Invalidate product-related cache entries
   */
  invalidateProductCache() {
    if (!this.config.enabled) return 0;
    
    const listDeleted = this.flush('productLists') ? 1 : 0;
    const detailDeleted = this.flush('products') ? 1 : 0;
    
    console.log(`🗄️  Product cache invalidated`);
    return listDeleted + detailDeleted;
  }

  /**
   * Invalidate specific product detail cache
   */
  invalidateProductDetail(productId) {
    if (!this.config.enabled) return false;
    
    const key = this.generateProductDetailKey(productId);
    return this.delete('products', key);
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;