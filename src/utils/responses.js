/**
 * Standard response object structure
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object|null} object - Response data object
 * @param {string[]|null} errors - List of error messages
 * @returns {object} - Base response object
 */
const createResponse = (success, message, object = null, errors = null) => {
  return {
    success,
    message,
    object,
    errors
  };
};

/**
 * Paginated response object structure (Page 3 PDF Requirement)
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object[]} object - List of objects
 * @param {number} pageNumber - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {number} totalSize - Total number of items
 * @param {string[]|null} errors - List of error messages
 * @returns {object} - Paginated response object with Page 3 PDF field naming
 */
const createPaginatedResponse = (success, message, object = [], pageNumber = 1, pageSize = 10, totalSize = 0, errors = null) => {
  return {
    success,
    message,
    object,
    PageNumber: pageNumber,  // Page 3 PDF Requirement: Use PageNumber (capitalized)
    pageSize,
    TotalSize: totalSize,    // Page 3 PDF Requirement: Use TotalSize (capitalized)
    errors
  };
};

/**
 * Paginated response object structure for User Story 5 - Get Products List
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object[]} products - Array of product objects
 * @param {number} currentPage - Current page number being displayed
 * @param {number} pageSize - Number of items on current page
 * @param {number} totalProducts - Total count of all products in database
 * @param {string[]|null} errors - List of error messages
 * @returns {object} - User Story 5 compliant paginated response
 */
const createProductListResponse = (success, message, products = [], currentPage = 1, pageSize = 10, totalProducts = 0, errors = null) => {
  const totalPages = Math.ceil(totalProducts / pageSize);
  
  return {
    success,
    message,
    currentPage,
    pageSize,
    totalPages,
    totalProducts,
    products,
    errors
  };
};

module.exports = {
  createResponse,
  createPaginatedResponse,
  createProductListResponse
};