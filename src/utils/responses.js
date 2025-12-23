const createResponse = (success, message, object = null, errors = null) => {
  return {
    success,
    message,
    object,
    errors
  };
};

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