const Product = require('../models/Product');
const imageService = require('../services/imageService');
const { createResponse } = require('../utils/responses');
const { 
  ValidationError, 
  NotFoundError,
  asyncErrorHandler 
} = require('../middlewares/errorHandler');

/**
 * Upload Product Image endpoint
 * POST /products/:id/image
 * 
 * Features:
 * - Upload single image for a product
 * - Image processing and optimization
 * - Multiple size generation (thumbnail, medium, large)
 * - Format conversion to WebP for optimization
 * - Admin only access
 */
const uploadProductImage = asyncErrorHandler(async (req, res) => {
  const { id: productId } = req.params;
  const file = req.file;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Process and save image
  const imageResult = await imageService.processAndSaveImage(file, productId);

  // Update product with image data
  const updatedProduct = await Product.update(productId, {
    images: imageResult
  });

  if (!updatedProduct) {
    // Clean up uploaded files if database update fails
    await imageService.deleteImageFiles(imageResult);
    throw new Error('Failed to update product with image data');
  }

  res.status(200).json(createResponse(
    true,
    'Product image uploaded successfully',
    {
      productId,
      images: imageResult.processedImages,
      uploadInfo: {
        originalFilename: imageResult.originalFilename,
        originalSize: imageResult.originalSize,
        processedAt: imageResult.metadata.processedAt,
        sizesGenerated: Object.keys(imageResult.processedImages).length
      }
    }
  ));
});

/**
 * Upload Multiple Product Images endpoint
 * POST /products/:id/images
 * 
 * Features:
 * - Upload multiple images for a product (max 5)
 * - Batch processing and optimization
 * - Admin only access
 */
const uploadProductImages = asyncErrorHandler(async (req, res) => {
  const { id: productId } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    throw new ValidationError('No images uploaded', ['At least one image file is required']);
  }

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Process all images
  const processedImages = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const imageResult = await imageService.processAndSaveImage(files[i], productId);
      processedImages.push({
        index: i,
        originalFilename: imageResult.originalFilename,
        images: imageResult.processedImages,
        metadata: imageResult.metadata
      });
    } catch (error) {
      errors.push(`Image ${i + 1} (${files[i].originalname}): ${error.message}`);
    }
  }

  // If no images were processed successfully
  if (processedImages.length === 0) {
    throw new ValidationError('Image processing failed', errors);
  }

  // Update product with all processed images
  const imageData = {
    images: processedImages,
    uploadedAt: new Date().toISOString(),
    totalImages: processedImages.length
  };

  const updatedProduct = await Product.update(productId, {
    images: imageData
  });

  if (!updatedProduct) {
    // Clean up uploaded files if database update fails
    for (const processedImage of processedImages) {
      await imageService.deleteImageFiles({ processedImages: processedImage.images });
    }
    throw new Error('Failed to update product with image data');
  }

  res.status(200).json(createResponse(
    true,
    `${processedImages.length} product images uploaded successfully`,
    {
      productId,
      imagesUploaded: processedImages.length,
      totalFiles: files.length,
      images: processedImages,
      errors: errors.length > 0 ? errors : undefined
    }
  ));
});

/**
 * Delete Product Image endpoint
 * DELETE /products/:id/image
 * 
 * Features:
 * - Remove all images for a product
 * - Clean up image files from storage
 * - Admin only access
 */
const deleteProductImage = asyncErrorHandler(async (req, res) => {
  const { id: productId } = req.params;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Delete image files if they exist
  if (product.images) {
    await imageService.deleteImageFiles(product.images);
  }

  // Update product to remove image data
  const updatedProduct = await Product.update(productId, {
    images: null
  });

  if (!updatedProduct) {
    throw new Error('Failed to update product image data');
  }

  res.status(200).json(createResponse(
    true,
    'Product images deleted successfully',
    {
      productId,
      deletedAt: new Date().toISOString()
    }
  ));
});

/**
 * Get Image Upload Configuration
 * GET /upload/config
 * 
 * Features:
 * - Return upload configuration and limits
 * - Help clients understand upload requirements
 * - Public endpoint for configuration info
 */
const getUploadConfig = asyncErrorHandler(async (req, res) => {
  const config = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    generatedSizes: ['thumbnail', 'medium', 'large'],
    outputFormat: 'webp',
    sizeConfigurations: {
      thumbnail: { width: 150, height: 150, fit: 'cover' },
      medium: { width: 500, height: 500, fit: 'inside' },
      large: { width: 1200, height: 1200, fit: 'inside' }
    },
    uploadEndpoints: {
      singleImage: 'POST /products/:id/image',
      multipleImages: 'POST /products/:id/images',
      deleteImages: 'DELETE /products/:id/image'
    }
  };

  res.status(200).json(createResponse(
    true,
    'Upload configuration retrieved successfully',
    config
  ));
});

/**
 * Get Storage Statistics (Admin only)
 * GET /admin/storage/stats
 * 
 * Features:
 * - Storage usage statistics
 * - File count and size information
 * - Admin monitoring tool
 */
const getStorageStats = asyncErrorHandler(async (req, res) => {
  const stats = await imageService.getStorageStats();

  if (!stats) {
    throw new Error('Failed to retrieve storage statistics');
  }

  // Format sizes for readability
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formattedStats = {
    totalFiles: stats.totalFiles,
    totalSize: formatSize(stats.totalSize),
    totalSizeBytes: stats.totalSize,
    directories: {}
  };

  for (const [dirName, dirStats] of Object.entries(stats.directories)) {
    formattedStats.directories[dirName] = {
      fileCount: dirStats.fileCount,
      totalSize: formatSize(dirStats.totalSize),
      totalSizeBytes: dirStats.totalSize,
      averageSize: formatSize(dirStats.averageSize),
      averageSizeBytes: dirStats.averageSize
    };
  }

  res.status(200).json(createResponse(
    true,
    'Storage statistics retrieved successfully',
    formattedStats
  ));
});

/**
 * Clean Up Orphaned Images (Admin only)
 * POST /admin/storage/cleanup
 * 
 * Features:
 * - Remove images for deleted products
 * - Storage optimization
 * - Admin maintenance tool
 */
const cleanupOrphanedImages = asyncErrorHandler(async (req, res) => {
  // Get all active product IDs
  const products = await db.getCollection('products').find({}, { projection: { id: 1 } }).toArray();
  const activeProductIds = products.map(product => product.id);

  // Clean up orphaned images
  await imageService.cleanupOrphanedImages(activeProductIds);

  // Get updated storage stats
  const stats = await imageService.getStorageStats();

  res.status(200).json(createResponse(
    true,
    'Orphaned images cleaned up successfully',
    {
      activeProducts: activeProductIds.length,
      storageStats: stats,
      cleanupAt: new Date().toISOString()
    }
  ));
});

module.exports = {
  uploadProductImage,
  uploadProductImages,
  deleteProductImage,
  getUploadConfig,
  getStorageStats,
  cleanupOrphanedImages
};