const express = require('express');
const { authenticateToken, requireAdmin, isAdmin } = require('../middlewares/auth');
const { uploadSingle, uploadMultiple, requireFile } = require('../middlewares/upload');
const { 
  uploadProductImage, 
  uploadProductImages, 
  deleteProductImage,
  getUploadConfig,
  getStorageStats,
  cleanupOrphanedImages
} = require('../controllers/imageController');

const router = express.Router();

/**
 * Image Upload Routes
 * All product image operations require admin authentication
 */

// Get upload configuration (public endpoint)
router.get('/upload/config', getUploadConfig);

// Upload single image for a product (Admin only)
router.post('/products/:id/image', 
  authenticateToken, 
  requireAdmin, 
  uploadSingle('image'), 
  requireFile, 
  uploadProductImage
);

// Upload multiple images for a product (Admin only)
router.post('/products/:id/images', 
  authenticateToken, 
  requireAdmin, 
  uploadMultiple('images', 5), 
  requireFile, 
  uploadProductImages
);

// Delete product images (Admin only)
router.delete('/products/:id/image', 
  authenticateToken, 
  requireAdmin, 
  deleteProductImage
);

// Admin storage management endpoints
router.get('/admin/storage/stats', 
  authenticateToken, 
  requireAdmin, 
  getStorageStats
);

router.post('/admin/storage/cleanup', 
  authenticateToken, 
  requireAdmin, 
  cleanupOrphanedImages
);

module.exports = router;