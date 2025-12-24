/**
 * Response Handler Utilities
 * Harmonizes pagination response formats between Page 3 and Page 7 requirements
 */

/**
 * Send paginated response that satisfies both Page 3 and Page 7 requirements
 * 
 * Page 3 PDF Requirements:
 * - PageNumber (capitalized)
 * - TotalSize (capitalized)
 * - pageSize (lowercase)
 * 
 * Page 7 PDF Requirements:
 * - currentPage (lowercase)
 * - totalPages (calculated)
 * - totalProducts (lowercase)
 * 
 * This function provides both formats to ensure compatibility
 * 
 * @param {object} res - Express response object
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object[]|object} data - Response data (array for lists, object for single items)
 * @param {number} currentPage - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {number} totalItems - Total number of items
 * @param {string[]|null} errors - List of error messages
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendPaginatedResponse = (
  res, 
  success, 
  message, 
  data = [], 
  currentPage = 1, 
  pageSize = 10, 
  totalItems = 0, 
  errors = null, 
  statusCode = 200
) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Create harmonized response that satisfies both Page 3 and Page 7
  const response = {
    success,
    message,
    
    // Page 3 PDF Requirements (capitalized fields)
    PageNumber: currentPage,    // Page 3 PDF: PageNumber (capitalized)
    TotalSize: totalItems,      // Page 3 PDF: TotalSize (capitalized)
    pageSize,                   // Page 3 PDF: pageSize (lowercase)
    
    // Page 7 PDF Requirements (lowercase fields)
    currentPage,                // Page 7 PDF: currentPage (lowercase)
    totalPages,                 // Page 7 PDF: totalPages (calculated)
    totalProducts: totalItems,  // Page 7 PDF: totalProducts (lowercase)
    
    // Data field - flexible naming based on context
    object: data,               // Page 3 PDF: object field
    products: Array.isArray(data) ? data : [data], // Page 7 PDF: products field
    
    errors
  };
  
  // Send response
  res.status(statusCode).json(response);
};

/**
 * Send paginated product list response (specialized for product endpoints)
 * Optimized for product listing with proper field naming
 * 
 * @param {object} res - Express response object
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object[]} products - Array of product objects
 * @param {number} currentPage - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {number} totalProducts - Total number of products
 * @param {string[]|null} errors - List of error messages
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendPaginatedProductResponse = (
  res, 
  success, 
  message, 
  products = [], 
  currentPage = 1, 
  pageSize = 10, 
  totalProducts = 0, 
  errors = null, 
  statusCode = 200
) => {
  sendPaginatedResponse(
    res, 
    success, 
    message, 
    products, 
    currentPage, 
    pageSize, 
    totalProducts, 
    errors, 
    statusCode
  );
};

/**
 * Send paginated order history response (specialized for order endpoints)
 * Optimized for order history with proper field naming
 * 
 * @param {object} res - Express response object
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object[]} orders - Array of order objects
 * @param {number} currentPage - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {number} totalOrders - Total number of orders
 * @param {string[]|null} errors - List of error messages
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendPaginatedOrderResponse = (
  res, 
  success, 
  message, 
  orders = [], 
  currentPage = 1, 
  pageSize = 10, 
  totalOrders = 0, 
  errors = null, 
  statusCode = 200
) => {
  // Create specialized response for orders
  const totalPages = Math.ceil(totalOrders / pageSize);
  
  const response = {
    success,
    message,
    
    // Page 3 PDF Requirements (capitalized fields)
    PageNumber: currentPage,    // Page 3 PDF: PageNumber (capitalized)
    TotalSize: totalOrders,     // Page 3 PDF: TotalSize (capitalized)
    pageSize,                   // Page 3 PDF: pageSize (lowercase)
    
    // Page 7 PDF Requirements (lowercase fields)
    currentPage,                // Page 7 PDF: currentPage (lowercase)
    totalPages,                 // Page 7 PDF: totalPages (calculated)
    totalOrders,                // Specialized: totalOrders for order context
    
    // Data fields
    object: orders,             // Page 3 PDF: object field
    orders,                     // Specialized: orders field for order context
    
    errors
  };
  
  res.status(statusCode).json(response);
};

/**
 * Create harmonized paginated response object (for internal use)
 * Returns response object without sending it
 * 
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object[]|object} data - Response data
 * @param {number} currentPage - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {number} totalItems - Total number of items
 * @param {string[]|null} errors - List of error messages
 * @returns {object} - Harmonized paginated response object
 */
const createHarmonizedPaginatedResponse = (
  success, 
  message, 
  data = [], 
  currentPage = 1, 
  pageSize = 10, 
  totalItems = 0, 
  errors = null
) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    success,
    message,
    
    // Page 3 PDF Requirements (capitalized fields)
    PageNumber: currentPage,    // Page 3 PDF: PageNumber (capitalized)
    TotalSize: totalItems,      // Page 3 PDF: TotalSize (capitalized)
    pageSize,                   // Page 3 PDF: pageSize (lowercase)
    
    // Page 7 PDF Requirements (lowercase fields)
    currentPage,                // Page 7 PDF: currentPage (lowercase)
    totalPages,                 // Page 7 PDF: totalPages (calculated)
    totalProducts: totalItems,  // Page 7 PDF: totalProducts (lowercase)
    
    // Data fields
    object: data,               // Page 3 PDF: object field
    products: Array.isArray(data) ? data : [data], // Page 7 PDF: products field
    
    errors
  };
};

module.exports = {
  sendPaginatedResponse,
  sendPaginatedProductResponse,
  sendPaginatedOrderResponse,
  createHarmonizedPaginatedResponse
};