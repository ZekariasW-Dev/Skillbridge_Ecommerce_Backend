const multer = require('multer');
const { createResponse } = require('../utils/responses');

/**
 * Multer configuration for handling file uploads
 * 
 * Features:
 * - Memory storage for processing with Sharp
 * - File size limits and validation
 * - MIME type filtering
 * - Error handling for upload issues
 */

// Multer configuration
const multerConfig = {
  storage: multer.memoryStorage(), // Store in memory for Sharp processing
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files per request
    fields: 10, // Maximum 10 non-file fields
    fieldSize: 1024 * 1024 // 1MB per field
  },
  fileFilter: (req, file, cb) => {
    // Allowed MIME types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
      error.code = 'INVALID_FILE_TYPE';
      return cb(error, false);
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = file.originalname.toLowerCase().match(/\.[^.]+$/);
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension[0])) {
      const error = new Error(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`);
      error.code = 'INVALID_FILE_EXTENSION';
      return cb(error, false);
    }

    // Additional security checks
    if (file.originalname.length > 255) {
      const error = new Error('Filename too long. Maximum 255 characters allowed');
      error.code = 'FILENAME_TOO_LONG';
      return cb(error, false);
    }

    // Check for potentially dangerous filenames
    const dangerousPatterns = [
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid filename characters
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i  // Windows reserved names
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(file.originalname)) {
        const error = new Error('Invalid filename. Contains dangerous characters or patterns');
        error.code = 'DANGEROUS_FILENAME';
        return cb(error, false);
      }
    }

    cb(null, true);
  }
};

// Create multer instance
const upload = multer(multerConfig);

/**
 * Middleware for single image upload
 */
const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (error) => {
      if (error) {
        return handleUploadError(error, res);
      }
      next();
    });
  };
};

/**
 * Middleware for multiple image uploads
 */
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (error) => {
      if (error) {
        return handleUploadError(error, res);
      }
      next();
    });
  };
};

/**
 * Middleware for mixed form data with images
 */
const uploadFields = (fields) => {
  return (req, res, next) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, (error) => {
      if (error) {
        return handleUploadError(error, res);
      }
      next();
    });
  };
};

/**
 * Handle upload errors and return appropriate responses
 */
const handleUploadError = (error, res) => {
  console.error('Upload error:', error);

  let statusCode = 400;
  let message = 'File upload failed';
  let errors = null; // Page 3 PDF Requirement: Use null instead of empty array

  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large';
      errors = [`File size exceeds the maximum limit of ${multerConfig.limits.fileSize / (1024 * 1024)}MB`];
      break;
      
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files';
      errors = [`Maximum ${multerConfig.limits.files} files allowed per request`];
      break;
      
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field';
      errors = ['Unexpected file field in the request'];
      break;
      
    case 'LIMIT_FIELD_COUNT':
      message = 'Too many fields';
      errors = [`Maximum ${multerConfig.limits.fields} fields allowed`];
      break;
      
    case 'LIMIT_FIELD_SIZE':
      message = 'Field value too large';
      errors = [`Field value exceeds maximum size of ${multerConfig.limits.fieldSize / (1024 * 1024)}MB`];
      break;
      
    case 'INVALID_FILE_TYPE':
    case 'INVALID_FILE_EXTENSION':
    case 'FILENAME_TOO_LONG':
    case 'DANGEROUS_FILENAME':
      message = 'Invalid file';
      errors = [error.message];
      break;
      
    default:
      message = 'Upload error';
      errors = [error.message || 'An error occurred during file upload'];
      statusCode = 500;
  }

  return res.status(statusCode).json(createResponse(
    false,
    message,
    null,
    errors
  ));
};

/**
 * Validation middleware to ensure file was uploaded
 */
const requireFile = (req, res, next) => {
  if (!req.file && (!req.files || req.files.length === 0)) {
    return res.status(400).json(createResponse(
      false,
      'File upload required',
      null,
      ['No file was uploaded. Please select an image file to upload.']
    ));
  }
  next();
};

/**
 * Validation middleware for optional file upload
 */
const optionalFile = (req, res, next) => {
  // Always proceed, file is optional
  next();
};

/**
 * Get upload configuration info
 */
const getUploadConfig = () => {
  return {
    maxFileSize: multerConfig.limits.fileSize,
    maxFiles: multerConfig.limits.files,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
  };
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  requireFile,
  optionalFile,
  getUploadConfig,
  handleUploadError
};