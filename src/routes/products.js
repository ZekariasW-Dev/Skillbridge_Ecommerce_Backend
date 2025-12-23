const express = require('express');
const { 
  createProduct, 
  updateProduct, 
  getAllProducts, 
  getProductById, 
  deleteProduct 
} = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

module.exports = router;