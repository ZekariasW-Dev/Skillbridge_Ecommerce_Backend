const express = require('express');
const { 
  createProduct, 
  updateProduct, 
  getAllProducts, 
  getProductById, 
  deleteProduct 
} = require('../controllers/productController');
const { authenticateToken, requireAdmin, isAdmin } = require('../middlewares/auth');
const { adminLimiter, searchLimiter } = require('../middlewares/rateLimiter');
const { 
  cacheProductList, 
  cacheProductDetail, 
  invalidateProductCache,
  cacheStats,
  flushCache
} = require('../middlewares/cache');

const router = express.Router();

// Cache management routes (admin only)
router.get('/cache/stats', authenticateToken, requireAdmin, cacheStats);
router.delete('/cache/flush', authenticateToken, requireAdmin, flushCache);

// Public routes with caching and search rate limiting
router.get('/', searchLimiter, cacheProductList, getAllProducts);
router.get('/:id', cacheProductDetail, getProductById);

// Admin only routes with cache invalidation and admin rate limiting
router.post('/', adminLimiter, authenticateToken, requireAdmin, invalidateProductCache, createProduct);
router.put('/:id', adminLimiter, authenticateToken, requireAdmin, invalidateProductCache, updateProduct);
router.delete('/:id', adminLimiter, authenticateToken, requireAdmin, invalidateProductCache, deleteProduct);

module.exports = router;