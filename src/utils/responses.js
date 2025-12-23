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
 * Paginated response object structure
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object[]} object - List of objects
 * @param {number} pageNumber - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {number} totalSize - Total number of items
 * @param {string[]|null} errors - List of error messages
 * @returns {object} - Paginated response object
 */
const createPaginatedResponse = (success, message, object = [], pageNumber = 1, pageSize = 10, totalSize = 0, errors = null) => {
  return {
    success,
    message,
    object,
    pageNumber,
    pageSize,
    totalSize,
    errors
  };
};

module.exports = {
  createResponse,
  createPaginatedResponse
};