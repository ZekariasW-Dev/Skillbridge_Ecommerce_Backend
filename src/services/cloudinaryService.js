const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');

/**
 * Cloudinary Image Service for handling product image uploads and management
 * 
 * Features:
 * - Cloud-based image storage
 * - Automatic image optimization
 * - Multiple size generation via URL transformations
 * - CDN delivery for fast loading
 * - Secure image management
 */

class CloudinaryService {
  constructor() {
    // Configure Cloudinary
    this.configureCloudinary();
    
    // Image configuration
    this.config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      folder: 'skillbridge-ecommerce', // Cloudinary folder
      transformations: {
        thumbnail: { width: 150, height: 150, crop: 'fill', quality: 'auto' },
        medium: { width: 500, height: 500, crop: 'limit', quality: 'auto' },
        large: { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
      }
    };
  }

  /**
   * Configure Cloudinary with environment variables
   */
  configureCloudinary() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('⚠️ Cloudinary credentials not found. Using fallback image service.');
      this.isConfigured = false;
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    this.isConfigured = true;
    console.log('✅ Cloudinary configured successfully');
  }

  /**
   * Check if Cloudinary is properly configured
   * @returns {boolean} - Configuration status
   */
  isCloudinaryConfigured() {
    return this.isConfigured;
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
   * Generate secure public ID for Cloudinary
   * @param {string} productId - Product UUID
   * @param {string} originalName - Original filename
   * @returns {string} - Secure public ID
   */
  generatePublicId(productId, originalName) {
    const timestamp = Date.now();
    const randomId = uuidv4().split('-')[0];
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `${this.config.folder}/products/${productId}_${timestamp}_${randomId}_${sanitizedName}`;
  }

  /**
   * Upload image to Cloudinary
   * @param {Object} file - Multer file object
   * @param {string} productId - Product UUID
   * @returns {Object} - Upload result with image URLs
   */
  async uploadImage(file, productId) {
    try {
      // Check if Cloudinary is configured
      if (!this.isConfigured) {
        throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
      }

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate public ID
      const publicId = this.generatePublicId(productId, file.originalname);

      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            folder: this.config.folder,
            resource_type: 'image',
            format: 'auto', // Auto-optimize format
            quality: 'auto', // Auto-optimize quality
            fetch_format: 'auto', // Auto-select best format for browser
            flags: 'progressive', // Progressive JPEG loading
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        // Write file buffer to upload stream
        uploadStream.end(file.buffer);
      });

      // Generate different size URLs using Cloudinary transformations
      const baseUrl = uploadResult.secure_url.split('/upload/')[0] + '/upload/';
      const publicIdPath = uploadResult.public_id;

      const imageUrls = {
        thumbnail: this.generateTransformedUrl(baseUrl, publicIdPath, this.config.transformations.thumbnail),
        medium: this.generateTransformedUrl(baseUrl, publicIdPath, this.config.transformations.medium),
        large: this.generateTransformedUrl(baseUrl, publicIdPath, this.config.transformations.large),
        original: uploadResult.secure_url
      };

      return {
        success: true,
        productId,
        cloudinaryPublicId: uploadResult.public_id,
        originalFilename: file.originalname,
        originalSize: file.size,
        originalMimeType: file.mimetype,
        imageUrls,
        cloudinaryData: {
          publicId: uploadResult.public_id,
          version: uploadResult.version,
          signature: uploadResult.signature,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          resourceType: uploadResult.resource_type,
          createdAt: uploadResult.created_at,
          bytes: uploadResult.bytes,
          url: uploadResult.url,
          secureUrl: uploadResult.secure_url
        },
        metadata: {
          originalWidth: uploadResult.width,
          originalHeight: uploadResult.height,
          format: uploadResult.format,
          uploadedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * Generate transformed URL for different sizes
   * @param {string} baseUrl - Base Cloudinary URL
   * @param {string} publicId - Public ID of the image
   * @param {Object} transformation - Transformation parameters
   * @returns {string} - Transformed image URL
   */
  generateTransformedUrl(baseUrl, publicId, transformation) {
    const transformParams = Object.entries(transformation)
      .map(([key, value]) => `${key}_${value}`)
      .join(',');
    
    return `${baseUrl}${transformParams}/${publicId}`;
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Object} - Deletion result
   */
  async deleteImage(publicId) {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary is not configured');
      }

      const result = await cloudinary.uploader.destroy(publicId);
      
      return {
        success: result.result === 'ok',
        publicId,
        result: result.result
      };

    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }

  /**
   * Get image details from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Object} - Image details
   */
  async getImageDetails(publicId) {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary is not configured');
      }

      const result = await cloudinary.api.resource(publicId);
      
      return {
        success: true,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        url: result.url,
        secureUrl: result.secure_url,
        createdAt: result.created_at,
        version: result.version
      };

    } catch (error) {
      console.error('Cloudinary get details error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List all images in the folder
   * @param {number} maxResults - Maximum number of results
   * @returns {Object} - List of images
   */
  async listImages(maxResults = 100) {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary is not configured');
      }

      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: this.config.folder,
        max_results: maxResults,
        resource_type: 'image'
      });

      return {
        success: true,
        images: result.resources.map(resource => ({
          publicId: resource.public_id,
          format: resource.format,
          width: resource.width,
          height: resource.height,
          bytes: resource.bytes,
          url: resource.url,
          secureUrl: resource.secure_url,
          createdAt: resource.created_at
        })),
        totalCount: result.total_count
      };

    } catch (error) {
      console.error('Cloudinary list images error:', error);
      return {
        success: false,
        error: error.message,
        images: []
      };
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Object} - Storage statistics
   */
  async getStorageStats() {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary is not configured');
      }

      const usage = await cloudinary.api.usage();
      
      return {
        success: true,
        stats: {
          totalImages: usage.resources,
          totalStorage: usage.storage,
          bandwidth: usage.bandwidth,
          transformations: usage.transformations,
          plan: usage.plan,
          lastUpdated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Cloudinary stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate optimized image URL with custom transformations
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} options - Transformation options
   * @returns {string} - Optimized image URL
   */
  generateOptimizedUrl(publicId, options = {}) {
    if (!this.isConfigured) {
      return null;
    }

    const defaultOptions = {
      quality: 'auto',
      fetch_format: 'auto',
      flags: 'progressive'
    };

    const transformOptions = { ...defaultOptions, ...options };

    return cloudinary.url(publicId, transformOptions);
  }

  /**
   * Fallback method for when Cloudinary is not configured
   * Uses the original local image service
   * @param {Object} file - Multer file object
   * @param {string} productId - Product UUID
   * @returns {Object} - Fallback result
   */
  async fallbackUpload(file, productId) {
    // Import the original image service as fallback
    const originalImageService = require('./imageService');
    
    try {
      const result = await originalImageService.processAndSaveImage(file, productId);
      
      // Convert local paths to URLs that match Cloudinary format
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      
      return {
        success: true,
        productId,
        cloudinaryPublicId: null,
        originalFilename: file.originalname,
        originalSize: file.size,
        originalMimeType: file.mimetype,
        imageUrls: {
          thumbnail: `${baseUrl}${result.processedImages.thumbnail.path}`,
          medium: `${baseUrl}${result.processedImages.medium.path}`,
          large: `${baseUrl}${result.processedImages.large.path}`,
          original: `${baseUrl}${result.processedImages.large.path}`
        },
        metadata: result.metadata,
        fallback: true
      };
      
    } catch (error) {
      throw new Error(`Fallback upload failed: ${error.message}`);
    }
  }

  /**
   * Main upload method that handles both Cloudinary and fallback
   * @param {Object} file - Multer file object
   * @param {string} productId - Product UUID
   * @returns {Object} - Upload result
   */
  async processAndSaveImage(file, productId) {
    if (this.isConfigured) {
      return await this.uploadImage(file, productId);
    } else {
      console.log('📸 Using fallback local image service (Cloudinary not configured)');
      return await this.fallbackUpload(file, productId);
    }
  }
}

module.exports = new CloudinaryService();