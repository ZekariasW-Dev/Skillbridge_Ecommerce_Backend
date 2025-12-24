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
      
      // API responses - short TTL for dynamic content
      responses: new NodeCache({
        stdTTL: isProduction ? 120 : 60, // 2 minutes in prod, 1 minute in dev
        checkperiod: 15,
        useClones: false,
        maxKeys: 1500,
        deleteOnExpire: true
      }),
      
      // Configuration and static data - long TTL
      config: new NodeCache({
        stdTTL: isProduction ? 3600 : 1800, // 1 hour in prod, 30 minutes in dev
        checkperiod: 300,
        useClones: false,
        maxKeys: 100,
        deleteOnExpire: true
      })
    };
    
    // Cache configuration
    this.config = {
      enabled: !isTest,
      environment: process.env.NODE_ENV || 'development',
      isProduction,
      isTest
    };
    
    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      flushes: 0,
      errors: 0,
      startTime: Date.now()
    };
    
    // Cache tags for invalidation patterns
    this.tags = new Map();
    
    // Setup event listeners for monitoring
    this.setupEventListeners();
    
    // Initialize cache warming
    this.initializeCacheWarming();
    
    console.log(`🗄️  Advanced Cache Service initialized (${this.config.enabled ? 'ENABLED' : 'DISABLED'})`);\n    if (this.config.enabled) {\n      console.log(`   - Environment: ${this.config.environment}`);\n      console.log(`   - Cache Types: ${Object.keys(this.caches).length}`);\n      console.log(`   - Total Max Keys: ${Object.values(this.caches).reduce((sum, cache) => sum + cache.options.maxKeys, 0)}`);\n    }\n  }\n\n  /**\n   * Setup event listeners for cache monitoring\n   */\n  setupEventListeners() {\n    Object.entries(this.caches).forEach(([cacheName, cache]) => {\n      cache.on('set', () => {\n        this.stats.sets++;\n        this.logCacheOperation('SET', cacheName);\n      });\n      \n      cache.on('del', () => {\n        this.stats.deletes++;\n        this.logCacheOperation('DELETE', cacheName);\n      });\n      \n      cache.on('expired', (key) => {\n        this.logCacheOperation('EXPIRED', cacheName, key);\n      });\n      \n      cache.on('flush', () => {\n        this.stats.flushes++;\n        this.logCacheOperation('FLUSH', cacheName);\n      });\n    });\n  }\n\n  /**\n   * Log cache operations (development mode only)\n   */\n  logCacheOperation(operation, cacheName, key = '') {\n    if (process.env.NODE_ENV === 'development') {\n      const timestamp = new Date().toISOString();\n      console.log(`🗄️  [${timestamp}] Cache ${operation}: ${cacheName}${key ? `:${key}` : ''}`);\n    }\n  }\n\n  /**\n   * Generate cache key with optional namespace and parameters\n   */\n  generateKey(namespace, identifier, params = {}) {\n    const baseKey = `${namespace}:${identifier}`;\n    \n    if (Object.keys(params).length === 0) {\n      return baseKey;\n    }\n    \n    // Sort parameters for consistent key generation\n    const sortedParams = Object.keys(params)\n      .sort()\n      .map(key => `${key}=${params[key]}`)\n      .join('&');\n    \n    // Hash long parameter strings to avoid key length issues\n    if (sortedParams.length > 100) {\n      const hash = crypto.createHash('md5').update(sortedParams).digest('hex');\n      return `${baseKey}:${hash}`;\n    }\n    \n    return `${baseKey}:${sortedParams}`;\n  }\n\n  /**\n   * Get value from cache\n   */\n  get(cacheType, key) {\n    if (!this.config.enabled) return null;\n    \n    try {\n      const cache = this.caches[cacheType];\n      if (!cache) {\n        throw new Error(`Invalid cache type: ${cacheType}`);\n      }\n      \n      const value = cache.get(key);\n      \n      if (value !== undefined) {\n        this.stats.hits++;\n        this.logCacheOperation('HIT', cacheType, key);\n        return value;\n      } else {\n        this.stats.misses++;\n        this.logCacheOperation('MISS', cacheType, key);\n        return null;\n      }\n    } catch (error) {\n      this.stats.errors++;\n      console.error('Cache get error:', error);\n      return null;\n    }\n  }\n\n  /**\n   * Set value in cache with optional TTL and tags\n   */\n  set(cacheType, key, value, ttl = null, tags = []) {\n    if (!this.config.enabled) return false;\n    \n    try {\n      const cache = this.caches[cacheType];\n      if (!cache) {\n        throw new Error(`Invalid cache type: ${cacheType}`);\n      }\n      \n      // Set with custom TTL if provided\n      const success = ttl ? cache.set(key, value, ttl) : cache.set(key, value);\n      \n      if (success) {\n        // Associate tags with this cache entry\n        tags.forEach(tag => {\n          if (!this.tags.has(tag)) {\n            this.tags.set(tag, new Set());\n          }\n          this.tags.get(tag).add({ cacheType, key });\n        });\n        \n        return true;\n      }\n      \n      return false;\n    } catch (error) {\n      this.stats.errors++;\n      console.error('Cache set error:', error);\n      return false;\n    }\n  }\n\n  /**\n   * Delete value from cache\n   */\n  delete(cacheType, key) {\n    if (!this.config.enabled) return false;\n    \n    try {\n      const cache = this.caches[cacheType];\n      if (!cache) {\n        throw new Error(`Invalid cache type: ${cacheType}`);\n      }\n      \n      const deleted = cache.del(key);\n      \n      // Remove from tag associations\n      this.tags.forEach((entries) => {\n        entries.forEach(entry => {\n          if (entry.cacheType === cacheType && entry.key === key) {\n            entries.delete(entry);\n          }\n        });\n      });\n      \n      return deleted > 0;\n    } catch (error) {\n      this.stats.errors++;\n      console.error('Cache delete error:', error);\n      return false;\n    }\n  }\n\n  /**\n   * Invalidate cache entries by tag\n   */\n  invalidateByTag(tag) {\n    if (!this.config.enabled) return 0;\n    \n    try {\n      const entries = this.tags.get(tag);\n      if (!entries) {\n        return 0;\n      }\n      \n      let deletedCount = 0;\n      entries.forEach(entry => {\n        if (this.delete(entry.cacheType, entry.key)) {\n          deletedCount++;\n        }\n      });\n      \n      // Clear the tag\n      this.tags.delete(tag);\n      \n      console.log(`🗄️  Invalidated ${deletedCount} cache entries by tag: ${tag}`);\n      return deletedCount;\n    } catch (error) {\n      this.stats.errors++;\n      console.error('Cache invalidate by tag error:', error);\n      return 0;\n    }\n  }\n\n  /**\n   * Invalidate cache entries by pattern\n   */\n  invalidateByPattern(cacheType, pattern) {\n    if (!this.config.enabled) return 0;\n    \n    try {\n      const cache = this.caches[cacheType];\n      if (!cache) {\n        throw new Error(`Invalid cache type: ${cacheType}`);\n      }\n      \n      const keys = cache.keys();\n      const regex = new RegExp(pattern);\n      let deletedCount = 0;\n      \n      keys.forEach(key => {\n        if (regex.test(key)) {\n          if (cache.del(key)) {\n            deletedCount++;\n          }\n        }\n      });\n      \n      console.log(`🗄️  Invalidated ${deletedCount} cache entries by pattern: ${pattern}`);\n      return deletedCount;\n    } catch (error) {\n      this.stats.errors++;\n      console.error('Cache invalidate by pattern error:', error);\n      return 0;\n    }\n  }\n\n  /**\n   * Clear all cache or specific cache type\n   */\n  flush(cacheType = null) {\n    if (!this.config.enabled) return false;\n    \n    try {\n      if (cacheType) {\n        const cache = this.caches[cacheType];\n        if (cache) {\n          cache.flushAll();\n          console.log(`🗄️  Flushed ${cacheType} cache`);\n          return true;\n        }\n        return false;\n      } else {\n        // Clear all caches\n        Object.entries(this.caches).forEach(([name, cache]) => {\n          cache.flushAll();\n        });\n        this.tags.clear();\n        console.log('🗄️  Flushed all caches');\n        return true;\n      }\n    } catch (error) {\n      this.stats.errors++;\n      console.error('Cache flush error:', error);\n      return false;\n    }\n  }\n\n  /**\n   * Get comprehensive cache statistics\n   */\n  getStats() {\n    try {\n      const stats = {\n        global: { ...this.stats },\n        caches: {},\n        memory: {\n          totalKeys: 0,\n          totalSize: 0\n        },\n        hitRate: 0,\n        uptime: Date.now() - this.stats.startTime\n      };\n      \n      Object.entries(this.caches).forEach(([cacheName, cache]) => {\n        const cacheStats = cache.getStats();\n        stats.caches[cacheName] = {\n          keys: cacheStats.keys,\n          hits: cacheStats.hits,\n          misses: cacheStats.misses,\n          ksize: cacheStats.ksize,\n          vsize: cacheStats.vsize,\n          hitRate: cacheStats.hits > 0 ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2) : 0\n        };\n        \n        stats.memory.totalKeys += cacheStats.keys;\n        stats.memory.totalSize += cacheStats.vsize;\n      });\n      \n      // Calculate global hit rate\n      const totalHits = this.stats.hits;\n      const totalRequests = this.stats.hits + this.stats.misses;\n      stats.hitRate = totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) : 0;\n      \n      return stats;\n    } catch (error) {\n      this.stats.errors++;\n      console.error('Cache get stats error:', error);\n      return null;\n    }\n  }\n\n  /**\n   * Get all cache keys for a specific cache type\n   */\n  getKeys(cacheType) {\n    if (!this.config.enabled) return [];\n    \n    try {\n      const cache = this.caches[cacheType];\n      if (!cache) {\n        throw new Error(`Invalid cache type: ${cacheType}`);\n      }\n      \n      return cache.keys();\n    } catch (error) {\n      this.stats.errors++;\n      console.error('Cache get keys error:', error);\n      return [];\n    }\n  }\n\n  /**\n   * Check if key exists in cache\n   */\n  has(cacheType, key) {\n    if (!this.config.enabled) return false;\n    \n    try {\n      const cache = this.caches[cacheType];\n      if (!cache) {\n        return false;\n      }\n      \n      return cache.has(key);\n    } catch (error) {\n      this.stats.errors++;\n      console.error('Cache has error:', error);\n      return false;\n    }\n  }\n\n  /**\n   * Get TTL for a key\n   */\n  getTtl(cacheType, key) {\n    if (!this.config.enabled) return null;\n    \n    try {\n      const cache = this.caches[cacheType];\n      if (!cache) {\n        return null;\n      }\n      \n      return cache.getTtl(key);\n    } catch (error) {\n      this.stats.errors++;\n      console.error('Cache get TTL error:', error);\n      return null;\n    }\n  }\n\n  /**\n   * Initialize cache warming for frequently accessed data\n   */\n  initializeCacheWarming() {\n    if (this.config.isProduction && this.config.enabled) {\n      // Set up periodic cache warming\n      setInterval(() => {\n        this.warmCache();\n      }, 300000); // Every 5 minutes\n    }\n  }\n\n  /**\n   * Warm cache with frequently accessed data\n   */\n  async warmCache() {\n    if (!this.config.enabled) return;\n    \n    try {\n      console.log('🔥 Cache warming initiated...');\n      \n      // Pre-load configuration\n      this.set('config', 'app_settings', {\n        maxFileSize: 10 * 1024 * 1024,\n        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],\n        cacheEnabled: true,\n        environment: this.config.environment\n      }, 3600); // 1 hour TTL\n      \n      // Pre-load upload configuration\n      this.set('config', 'upload_config', {\n        maxFileSize: 10 * 1024 * 1024,\n        maxFiles: 5,\n        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],\n        generatedSizes: ['thumbnail', 'medium', 'large']\n      }, 3600);\n      \n      console.log('🔥 Cache warming completed');\n      \n    } catch (error) {\n      console.error('Cache warming error:', error);\n    }\n  }\n\n  /**\n   * Get cache health status\n   */\n  getHealthStatus() {\n    try {\n      const stats = this.getStats();\n      const memoryUsage = process.memoryUsage();\n      \n      return {\n        status: 'healthy',\n        enabled: this.config.enabled,\n        environment: this.config.environment,\n        caches: Object.keys(this.caches).length,\n        totalKeys: stats.memory.totalKeys,\n        hitRate: parseFloat(stats.hitRate),\n        memoryUsage: {\n          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB\n          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB\n          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) // MB\n        },\n        errors: this.stats.errors,\n        uptime: Math.round((Date.now() - this.stats.startTime) / 1000) // seconds\n      };\n    } catch (error) {\n      return {\n        status: 'error',\n        enabled: this.config.enabled,\n        error: error.message\n      };\n    }\n  }\n\n  /**\n   * Cleanup expired entries and optimize memory\n   */\n  cleanup() {\n    if (!this.config.enabled) return 0;\n    \n    try {\n      let totalCleaned = 0;\n      \n      Object.entries(this.caches).forEach(([cacheName, cache]) => {\n        const keysBefore = cache.getStats().keys;\n        \n        // Force cleanup of expired keys\n        cache.keys().forEach(key => {\n          // This will trigger cleanup of expired keys\n          cache.has(key);\n        });\n        \n        const keysAfter = cache.getStats().keys;\n        const cleaned = keysBefore - keysAfter;\n        totalCleaned += cleaned;\n        \n        if (cleaned > 0) {\n          console.log(`🧹 Cleaned ${cleaned} expired keys from ${cacheName} cache`);\n        }\n      });\n      \n      // Clean up orphaned tags\n      this.tags.forEach((entries, tag) => {\n        const validEntries = new Set();\n        entries.forEach(entry => {\n          if (this.has(entry.cacheType, entry.key)) {\n            validEntries.add(entry);\n          }\n        });\n        \n        if (validEntries.size === 0) {\n          this.tags.delete(tag);\n        } else {\n          this.tags.set(tag, validEntries);\n        }\n      });\n      \n      return totalCleaned;\n    } catch (error) {\n      console.error('Cache cleanup error:', error);\n      return 0;\n    }\n  }\n\n  // Legacy methods for backward compatibility\n  \n  /**\n   * Legacy get method (uses 'responses' cache by default)\n   */\n  legacyGet(key) {\n    return this.get('responses', key);\n  }\n\n  /**\n   * Legacy set method (uses 'responses' cache by default)\n   */\n  legacySet(key, value, ttl = null) {\n    return this.set('responses', key, value, ttl);\n  }\n\n  /**\n   * Legacy delete method (uses 'responses' cache by default)\n   */\n  legacyDelete(key) {\n    return this.delete('responses', key);\n  }\n\n  /**\n   * Generate cache key for product listing\n   */\n  generateProductListKey(page, pageSize, search, category, sortBy, sortOrder) {\n    const params = {\n      page: page || 1,\n      pageSize: pageSize || 10,\n      ...(search && { search }),\n      ...(category && { category }),\n      ...(sortBy && { sortBy }),\n      ...(sortOrder && { sortOrder })\n    };\n    \n    return this.generateKey('products', 'list', params);\n  }\n\n  /**\n   * Generate cache key for product details\n   */\n  generateProductDetailKey(productId) {\n    return this.generateKey('products', 'detail', { id: productId });\n  }\n\n  /**\n   * Invalidate product-related cache entries\n   */\n  invalidateProductCache() {\n    if (!this.config.enabled) return 0;\n    \n    const listDeleted = this.invalidateByPattern('productLists', 'products:list:.*');\n    const detailDeleted = this.invalidateByPattern('products', 'products:detail:.*');\n    \n    console.log(`🗄️  Product cache invalidated (${listDeleted + detailDeleted} keys deleted)`);\n    return listDeleted + detailDeleted;\n  }\n\n  /**\n   * Invalidate specific product detail cache\n   */\n  invalidateProductDetail(productId) {\n    if (!this.config.enabled) return false;\n    \n    const key = this.generateProductDetailKey(productId);\n    return this.delete('products', key);\n  }\n}\n\n// Create singleton instance\nconst cacheService = new CacheService();\n\nmodule.exports = cacheService;