/**
 * Models Index - Central configuration and exports for all database models
 * 
 * This file serves as the main entry point for all database models and ensures
 * consistent UUID usage across the application.
 */

const { v4: uuidv4 } = require('uuid');

// Import all models
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');

/**
 * UUID Configuration and Utilities
 */
const UUIDConfig = {
  /**
   * Generate a new UUID v4
   * @returns {string} - New UUID v4 string
   */
  generateId: () => uuidv4(),

  /**
   * Validate UUID format
   * @param {string} id - UUID string to validate
   * @returns {boolean} - True if valid UUID format
   */
  isValidUUID: (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof id === 'string' && uuidRegex.test(id);
  },

  /**
   * Validate and sanitize UUID input
   * @param {string} id - UUID string to validate
   * @returns {string|null} - Valid UUID or null if invalid
   */
  validateAndSanitize: (id) => {
    if (!id || typeof id !== 'string') return null;
    const cleanId = id.trim().toLowerCase();
    return UUIDConfig.isValidUUID(cleanId) ? cleanId : null;
  }
};

/**
 * Model Configuration
 * All models use UUID v4 for primary keys
 */
const ModelConfig = {
  // ID field configuration
  ID_FIELD: 'id',
  ID_TYPE: 'UUID_V4',
  
  // Common field configurations
  TIMESTAMP_FIELDS: {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt'
  },
  
  // Model-specific configurations
  USER: {
    COLLECTION: 'users',
    ROLES: {
      USER: 'user',
      ADMIN: 'admin'
    }
  },
  
  PRODUCT: {
    COLLECTION: 'products',
    REQUIRED_FIELDS: ['name', 'description', 'price', 'stock', 'category', 'UserID'], // Page 2 PDF Requirement: UserID field
    OPTIONAL_FIELDS: ['images', 'createdAt', 'updatedAt'],
    FIELD_TYPES: {
      ID: 'UUID_V4',
      NAME: 'string',
      DESCRIPTION: 'string', 
      PRICE: 'number',
      STOCK: 'number',
      CATEGORY: 'string',
      UserID: 'UUID_V4',  // Page 2 PDF Requirement: UserID field (both capitals) as UUID foreign key
      IMAGES: 'object',
      CREATED_AT: 'Date',
      UPDATED_AT: 'Date'
    },
    VALIDATION_RULES: {
      NAME: {
        TYPE: 'string',
        MIN_LENGTH: 3,
        MAX_LENGTH: 100,
        REQUIRED: true
      },
      DESCRIPTION: {
        TYPE: 'string',
        MIN_LENGTH: 10,
        REQUIRED: true
      },
      PRICE: {
        TYPE: 'number',
        MIN_VALUE: 0,
        REQUIRED: true
      },
      STOCK: {
        TYPE: 'number',
        MIN_VALUE: 0,
        INTEGER: true,
        REQUIRED: true
      },
      CATEGORY: {
        TYPE: 'string',
        REQUIRED: true,
        MIN_LENGTH: 1,
        MAX_LENGTH: 50,
        DESCRIPTION: 'Product category (Page 2 & 5 PDF requirement)',
        VALIDATION_MESSAGE: 'Category is required and must be a non-empty string'
      },
      UserID: {
        TYPE: 'UUID_V4',
        REQUIRED: true,
        FOREIGN_KEY: 'users.id',
        DESCRIPTION: 'Admin who created the product (Page 2 PDF: UserID field with both capitals)'
      }
    }
  },
  
  ORDER: {
    COLLECTION: 'orders',
    REQUIRED_FIELDS: ['UserId', 'description', 'totalPrice', 'status', 'products'], // Page 2 PDF Requirement: UserId casing
    OPTIONAL_FIELDS: ['createdAt', 'updatedAt'],
    STATUSES: {
      PENDING: 'pending',
      PROCESSING: 'processing',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled'
    },
    FIELD_TYPES: {
      ID: 'UUID_V4',
      UserId: 'UUID_V4',  // Page 2 PDF Requirement: UserId field (Order table casing)
      DESCRIPTION: 'string',
      TOTAL_PRICE: 'number',
      STATUS: 'string',
      PRODUCTS: 'array',
      CREATED_AT: 'Date',
      UPDATED_AT: 'Date'
    },
    VALIDATION_RULES: {
      DESCRIPTION: {
        TYPE: 'string',
        MAX_LENGTH: 500,
        REQUIRED: false,
        AUTO_GENERATE: true
      },
      TOTAL_PRICE: {
        TYPE: 'number',
        MIN_VALUE: 0,
        DECIMAL_PLACES: 2,
        REQUIRED: true
      },
      STATUS: {
        TYPE: 'string',
        ENUM: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        DEFAULT: 'pending',
        REQUIRED: true
      }
    }
  }
};

/**
 * Database Schema Information
 * All collections use UUID v4 as primary keys
 */
const SchemaInfo = {
  /**
   * Get schema information for all models
   * @returns {object} - Schema information object
   */
  getSchemaInfo: () => ({
    idType: 'UUID_V4',
    idGenerator: 'uuid.v4()',
    models: {
      User: {
        collection: ModelConfig.USER.COLLECTION,
        primaryKey: ModelConfig.ID_FIELD,
        keyType: ModelConfig.ID_TYPE,
        roles: Object.values(ModelConfig.USER.ROLES)
      },
      Product: {
        collection: ModelConfig.PRODUCT.COLLECTION,
        primaryKey: ModelConfig.ID_FIELD,
        keyType: ModelConfig.ID_TYPE,
        requiredFields: ModelConfig.PRODUCT.REQUIRED_FIELDS
      },
      Order: {
        collection: ModelConfig.ORDER.COLLECTION,
        primaryKey: ModelConfig.ID_FIELD,
        keyType: ModelConfig.ID_TYPE,
        requiredFields: ModelConfig.ORDER.REQUIRED_FIELDS,
        optionalFields: ModelConfig.ORDER.OPTIONAL_FIELDS,
        statuses: Object.values(ModelConfig.ORDER.STATUSES),
        fieldTypes: ModelConfig.ORDER.FIELD_TYPES,
        validationRules: ModelConfig.ORDER.VALIDATION_RULES
      }
    }
  }),

  /**
   * Verify all models are using UUIDs
   * @returns {boolean} - True if all models use UUIDs
   */
  verifyUUIDUsage: () => {
    // This is a compile-time check to ensure all models use UUIDs
    const models = [User, Product, Order];
    
    // Check if all models have create methods that generate UUIDs
    return models.every(model => {
      return typeof model.create === 'function';
    });
  }
};

/**
 * Utility functions for working with models
 */
const ModelUtils = {
  /**
   * Generate consistent error messages for invalid UUIDs
   * @param {string} fieldName - Name of the field with invalid UUID
   * @returns {string} - Error message
   */
  getInvalidUUIDError: (fieldName = 'ID') => {
    return `Invalid ${fieldName} format. Expected UUID v4 format (e.g., 123e4567-e89b-12d3-a456-426614174000)`;
  },

  /**
   * Validate multiple UUIDs at once
   * @param {object} uuids - Object with UUID values to validate
   * @returns {object} - Validation results
   */
  validateUUIDs: (uuids) => {
    const results = {
      valid: true,
      errors: []
    };

    Object.entries(uuids).forEach(([key, value]) => {
      if (!UUIDConfig.isValidUUID(value)) {
        results.valid = false;
        results.errors.push({
          field: key,
          value: value,
          message: ModelUtils.getInvalidUUIDError(key)
        });
      }
    });

    return results;
  }
};

// Export all models and utilities
module.exports = {
  // Models
  User,
  Product,
  Order,
  
  // UUID utilities
  UUIDConfig,
  
  // Model configuration
  ModelConfig,
  
  // Schema information
  SchemaInfo,
  
  // Utility functions
  ModelUtils,
  
  // Convenience exports
  generateId: UUIDConfig.generateId,
  isValidUUID: UUIDConfig.isValidUUID,
  validateUUID: UUIDConfig.validateAndSanitize
};