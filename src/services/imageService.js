const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/**
 * Image Service for handling product image uploads, processing, and storage
 * 
 * Features:
 * - Image validation and security checks
 * - Multiple size generation (thumbnail, medium, large)
 * - Format optimization (WebP conversion)
 * - File size optimization
 * - Secure file naming and storage
 */

class ImageService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.imagesDir = path.join(this.uploadDir, 'images');
    this.thumbnailsDir = path.join(this.uploadDir, 'thumbnails');
    this.mediumDir = path.join(this.uploadDir, 'medium');
    
    // Image configuration
    this.config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      sizes: {
        thumbnail: { width: 150, height: 150 },
        medium: { width: 500, height: 500 },
        large: { width: 1200, height: 1200 }
      },
      quality: {
        jpeg: 85,
        webp: 80,
        png: 90
      }
    };
    
    this.initializeDirectories();
  }

  /**
   * Initialize upload directories
   */
  async initializeDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.imagesDir, { recursive: true });
      await fs.mkdir(this.thumbnailsDir, { recursive: true });
      await fs.mkdir(this.mediumDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  /**
   * Validate uploaded file
   * @param {Object} file - Multer file object
   * @returns {Object} - Validation result
   */
  validateFile(file) {
    const errors = [];

    // Check if file exists
    if (!file) {
      errors.push('No file uploaded');
      return { isValid: false, errors };
    }

    // Check file size
    if (file.size > this.config.maxFileSize) {
      errors.push(`File size too large. Maximum allowed: ${this.config.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check MIME type
    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`Invalid file type. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`);
    }

    // Check file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!this.config.allowedExtensions.includes(fileExtension)) {
      errors.push(`Invalid file extension. Allowed extensions: ${this.config.allowedExtensions.join(', ')}`);
    }

    // Basic security check - ensure it's actually an image
    if (!file.mimetype.startsWith('image/')) {
      errors.push('File is not a valid image');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate secure filename
   * @param {string} originalName - Original filename
   * @returns {string} - Secure filename
   */
  generateSecureFilename(originalName) {
    const extension = path.extname(originalName).toLowerCase();
    const uuid = uuidv4();
    const timestamp = Date.now();
    return `${uuid}_${timestamp}${extension}`;
  }

  /**
   * Process and save image in multiple sizes
   * @param {Object} file - Multer file object
   * @param {string} productId - Product UUID
   * @returns {Object} - Processing result with image URLs
   */
  async processAndSaveImage(file, productId) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate secure filename
      const secureFilename = this.generateSecureFilename(file.originalname);
      const baseFilename = path.parse(secureFilename).name;

      // Load image with Sharp
      const image = sharp(file.buffer);
      const metadata = await image.metadata();

      // Validate image metadata
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image: Unable to read image dimensions');
      }

      // Security check: Ensure reasonable dimensions
      if (metadata.width > 5000 || metadata.height > 5000) {
        throw new Error('Image dimensions too large. Maximum: 5000x5000 pixels');
      }

      const processedImages = {};

      // Process thumbnail
      const thumbnailFilename = `${baseFilename}_thumb.webp`;
      const thumbnailPath = path.join(this.thumbnailsDir, thumbnailFilename);
      
      await image
        .resize(this.config.sizes.thumbnail.width, this.config.sizes.thumbnail.height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: this.config.quality.webp })
        .toFile(thumbnailPath);

      processedImages.thumbnail = {
        filename: thumbnailFilename,
        path: `/uploads/thumbnails/${thumbnailFilename}`,
        size: 'thumbnail',
        width: this.config.sizes.thumbnail.width,
        height: this.config.sizes.thumbnail.height
      };

      // Process medium size
      const mediumFilename = `${baseFilename}_medium.webp`;
      const mediumPath = path.join(this.mediumDir, mediumFilename);
      
      await image
        .resize(this.config.sizes.medium.width, this.config.sizes.medium.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: this.config.quality.webp })
        .toFile(mediumPath);

      processedImages.medium = {
        filename: mediumFilename,
        path: `/uploads/medium/${mediumFilename}`,
        size: 'medium',
        width: this.config.sizes.medium.width,
        height: this.config.sizes.medium.height
      };

      // Process large/original size
      const largeFilename = `${baseFilename}_large.webp`;
      const largePath = path.join(this.imagesDir, largeFilename);
      
      await image
        .resize(this.config.sizes.large.width, this.config.sizes.large.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: this.config.quality.webp })
        .toFile(largePath);

      processedImages.large = {
        filename: largeFilename,
        path: `/uploads/images/${largeFilename}`,
        size: 'large',
        width: this.config.sizes.large.width,
        height: this.config.sizes.large.height
      };

      // Get file sizes
      for (const size of Object.keys(processedImages)) {
        const filePath = size === 'thumbnail' ? 
          path.join(this.thumbnailsDir, processedImages[size].filename) :
          size === 'medium' ?
          path.join(this.mediumDir, processedImages[size].filename) :
          path.join(this.imagesDir, processedImages[size].filename);
        
        const stats = await fs.stat(filePath);
        processedImages[size].fileSize = stats.size;
      }

      return {
        success: true,
        productId,
        originalFilename: file.originalname,
        originalSize: file.size,
        originalMimeType: file.mimetype,
        processedImages,
        metadata: {
          originalWidth: metadata.width,
          originalHeight: metadata.height,
          format: metadata.format,
          processedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  /**
   * Delete image files
   * @param {Object} imageData - Image data with file paths
   */
  async deleteImageFiles(imageData) {
    try {
      if (!imageData || !imageData.processedImages) {
        return;
      }

      const deletePromises = [];

      for (const size of Object.keys(imageData.processedImages)) {
        const image = imageData.processedImages[size];
        let filePath;

        switch (size) {
          case 'thumbnail':
            filePath = path.join(this.thumbnailsDir, image.filename);
            break;
          case 'medium':
            filePath = path.join(this.mediumDir, image.filename);
            break;
          case 'large':
            filePath = path.join(this.imagesDir, image.filename);
            break;
        }

        if (filePath) {
          deletePromises.push(
            fs.unlink(filePath).catch(error => {
              console.error(`Error deleting file ${filePath}:`, error);
            })
          );
        }
      }

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting image files:', error);
    }
  }

  /**
   * Get image file stats
   * @param {string} filename - Image filename
   * @param {string} size - Image size (thumbnail, medium, large)
   * @returns {Object} - File stats
   */
  async getImageStats(filename, size = 'large') {
    try {
      let filePath;
      
      switch (size) {
        case 'thumbnail':
          filePath = path.join(this.thumbnailsDir, filename);
          break;
        case 'medium':
          filePath = path.join(this.mediumDir, filename);
          break;
        case 'large':
          filePath = path.join(this.imagesDir, filename);
          break;
        default:
          throw new Error('Invalid image size specified');
      }

      const stats = await fs.stat(filePath);
      const image = sharp(filePath);
      const metadata = await image.metadata();

      return {
        exists: true,
        size: stats.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        lastModified: stats.mtime
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  /**
   * Clean up orphaned image files
   * @param {Array} activeProductIds - Array of active product IDs
   */
  async cleanupOrphanedImages(activeProductIds = []) {
    try {
      const directories = [this.imagesDir, this.thumbnailsDir, this.mediumDir];
      
      for (const directory of directories) {
        const files = await fs.readdir(directory);
        
        for (const file of files) {
          // Extract product ID from filename (assuming UUID format)
          const productIdMatch = file.match(/^([a-f0-9-]{36})/);
          
          if (productIdMatch) {
            const productId = productIdMatch[1];
            
            if (!activeProductIds.includes(productId)) {
              const filePath = path.join(directory, file);
              await fs.unlink(filePath);
              console.log(`Cleaned up orphaned image: ${file}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up orphaned images:', error);
    }
  }

  /**
   * Get storage statistics
   * @returns {Object} - Storage statistics
   */
  async getStorageStats() {
    try {
      const directories = [
        { name: 'images', path: this.imagesDir },
        { name: 'thumbnails', path: this.thumbnailsDir },
        { name: 'medium', path: this.mediumDir }
      ];

      const stats = {
        totalFiles: 0,
        totalSize: 0,
        directories: {}
      };

      for (const dir of directories) {
        const files = await fs.readdir(dir.path);
        let dirSize = 0;

        for (const file of files) {
          const filePath = path.join(dir.path, file);
          const fileStat = await fs.stat(filePath);
          dirSize += fileStat.size;
        }

        stats.directories[dir.name] = {
          fileCount: files.length,
          totalSize: dirSize,
          averageSize: files.length > 0 ? Math.round(dirSize / files.length) : 0
        };

        stats.totalFiles += files.length;
        stats.totalSize += dirSize;
      }

      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  }
}

module.exports = new ImageService();