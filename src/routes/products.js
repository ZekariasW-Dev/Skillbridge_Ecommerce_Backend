const express = require('express');
const { 
  createProduct, 
  updateProduct, 
  getAllProducts, 
  getProductById, 
  deleteProduct 
} = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { adminLimiter, searchLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Public routes with search rate limiting
router.get('/', searchLimiter, getAllProducts);
router.get('/:id', getProductById);

// Admin only routes with admin rate limiting
router.post('/', adminLimiter, authenticateToken, requireAdmin, createProduct);
router.put('/:id', adminLimiter, authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', adminLimiter, authenticateToken, requireAdmin, deleteProduct);

module.exports = router;