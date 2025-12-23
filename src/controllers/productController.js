const Product = require('../models/Product');
const { createResponse, createPaginatedResponse, createProductListResponse } = require('../utils/responses');
const { validateProduct, validateProductUpdate } = require('../utils/validation');

/**
 * Create Product endpoint - User Story 3
 * POST /products
 * 
 * Acceptance Criteria:
 * 1. Admin must send POST request with name, description, price, stock, category
 * 2. Protected endpoint - only authenticated Admin users can access
 * 3. Input validation for all fields with specific requirements
 * 4. Returns 201 Created with product data on success
 * 5. Returns 400 Bad Request with clear error messages on validation failure
 * 6. Returns 401 Unauthorized for unauthenticated users
 * 7. Returns 403 Forbidden for non-admin users
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const userId = req.user.userId; // From JWT token (authenticated admin)
    
    // Input validation according to User Story 3 requirements
    const productData = { name, description, price, stock, category };
    const validationErrors = validateProduct(productData);
    
    if (validationErrors.length > 0) {
      return res.status(400).json(createResponse(
        false, 
        'Product creation failed', 
        null, 
        validationErrors
      ));
    }
    
    // Create product with validated data
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      category: category.trim(),
      userId
    });
    
    // Return 201 Created with newly created product data
    res.status(201).json(createResponse(
      true, 
      'Product created successfully', 
      product
    ));
    
  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle MongoDB duplicate key errors if any
    if (error.code === 11000) {
      return res.status(400).json(createResponse(
        false, 
        'Product creation failed', 
        null, 
        ['A product with this information already exists']
      ));
    }
    
    res.status(500).json(createResponse(
      false, 
      'Internal server error', 
      null, 
      ['Product creation failed due to server error']
    ));
  }
};

/**
 * Update Product endpoint - User Story 4
 * PUT /products/:id
 * 
 * Acceptance Criteria:
 * 1. Admin sends PUT request to /products/:id with optional fields to update
 * 2. Protected endpoint - only authenticated Admin users can access
 * 3. Any provided field must meet same validation criteria as product creation
 * 4. Returns 404 Not Found if product doesn't exist
 * 5. Returns 400 Bad Request for validation failures with clear error messages
 * 6. Returns 200 OK with updated product data on success
 * 7. Returns 401 Unauthorized for unauthenticated users
 * 8. Returns 403 Forbidden for non-admin users
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    
    // Only include provided fields for partial updates (User Story 4 requirement)
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.stock !== undefined) updateData.stock = req.body.stock;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    
    // Check if any fields were provided for update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json(createResponse(
        false, 
        'Product update failed', 
        null, 
        ['At least one field must be provided for update']
      ));
    }
    
    // Validate provided fields using User Story 4 validation (same criteria as creation)
    const validationErrors = validateProductUpdate(updateData);
    
    if (validationErrors.length > 0) {
      return res.status(400).json(createResponse(
        false, 
        'Product update failed', 
        null, 
        validationErrors
      ));
    }
    
    // Check if product exists (User Story 4 requirement)
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json(createResponse(
        false, 
        'Product not found', 
        null, 
        ['Product with the specified ID does not exist']
      ));
    }
    
    // Prepare update data with proper data types
    const processedUpdateData = {};
    if (updateData.name !== undefined) processedUpdateData.name = updateData.name.trim();
    if (updateData.description !== undefined) processedUpdateData.description = updateData.description.trim();
    if (updateData.price !== undefined) processedUpdateData.price = parseFloat(updateData.price);
    if (updateData.stock !== undefined) processedUpdateData.stock = parseInt(updateData.stock);
    if (updateData.category !== undefined) processedUpdateData.category = updateData.category.trim();
    
    // Update product
    const updatedProduct = await Product.update(id, processedUpdateData);
    
    if (!updatedProduct) {
      return res.status(500).json(createResponse(
        false, 
        'Product update failed', 
        null, 
        ['Failed to update product']
      ));
    }
    
    // Return 200 OK with updated product data (User Story 4 requirement)
    res.status(200).json(createResponse(
      true, 
      'Product updated successfully', 
      updatedProduct
    ));
    
  } catch (error) {
    console.error('Update product error:', error);
    
    // Handle MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json(createResponse(
        false, 
        'Product update failed', 
        null, 
        ['A product with this information already exists']
      ));
    }
    
    res.status(500).json(createResponse(
      false, 
      'Internal server error', 
      null, 
      ['Product update failed due to server error']
    ));
  }
};

/**
 * Get All Products endpoint - User Stories 5 & 6
 * GET /products
 * 
 * User Story 5 - Get List of Products:
 * 1. GET request to /products retrieves list of all products
 * 2. Public endpoint - accessible without authentication
 * 3. Supports pagination with query parameters
 * 
 * User Story 6 - Search for Products:
 * 1. Accepts ?search=productName query parameter
 * 2. Empty or missing search returns all products (User Story 5 behavior)
 * 3. Non-empty search performs case-insensitive, partial-match against product name
 * 4. totalProducts reflects search results count, not all products
 */
const getAllProducts = async (req, res) => {
  try {
    // Parse pagination parameters (User Story 5 requirements)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit || req.query.pageSize) || 10;
    
    // Parse search parameter (User Story 6 requirement)
    const search = req.query.search || '';
    
    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json(createResponse(
        false,
        'Invalid pagination parameters',
        null,
        ['Page number must be 1 or greater']
      ));
    }
    
    if (pageSize < 1 || pageSize > 100) {
      return res.status(400).json(createResponse(
        false,
        'Invalid pagination parameters',
        null,
        ['Page size must be between 1 and 100']
      ));
    }
    
    // Get products with pagination and optional search (User Stories 5 & 6)
    const result = await Product.findAll(page, pageSize, search);
    
    // Format products to include essential information (User Story 5 requirement)
    const formattedProducts = result.products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      createdAt: product.createdAt
    }));
    
    // Determine response message based on search (User Story 6)
    let message = 'Products retrieved successfully';
    if (search && search.trim().length > 0) {
      message = `Products matching "${search.trim()}" retrieved successfully`;
    }
    
    // Return User Stories 5 & 6 compliant response format
    // totalProducts reflects search results count (User Story 6 requirement)
    res.status(200).json(createProductListResponse(
      true,
      message,
      formattedProducts,
      page,
      pageSize,
      result.totalSize
    ));
    
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json(createResponse(
      false, 
      'Internal server error', 
      null, 
      ['Failed to retrieve products']
    ));
  }
};

/**
 * Get Product by ID endpoint - User Story 7
 * GET /products/:id
 * 
 * Acceptance Criteria:
 * 1. GET request to /products/:id retrieves details for specific product
 * 2. Public endpoint - accessible to all users without authentication
 * 3. Product id must be included in URL path
 * 4. Success: 200 OK with complete product object (id, name, description, price, stock, category)
 * 5. Failure: 404 Not Found with clear error message if product not found
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate that id parameter is provided
    if (!id || id.trim().length === 0) {
      return res.status(400).json(createResponse(
        false, 
        'Invalid request', 
        null, 
        ['Product ID is required in the URL path']
      ));
    }
    
    // Find product by ID (User Story 7 requirement)
    const product = await Product.findById(id.trim());
    
    // Handle product not found (User Story 7 requirement)
    if (!product) {
      return res.status(404).json(createResponse(
        false, 
        'Product not found', 
        null, 
        ['Product not found']
      ));
    }
    
    // Return 200 OK with complete product object (User Story 7 requirement)
    // Include all product details: id, name, description, price, stock, category
    res.status(200).json(createResponse(
      true, 
      'Product details retrieved successfully', 
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        userId: product.userId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    ));
    
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json(createResponse(
      false, 
      'Internal server error', 
      null, 
      ['Failed to retrieve product details']
    ));
  }
};

/**
 * Delete Product endpoint
 * DELETE /products/:id
 * Admin only
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json(createResponse(
        false, 
        'Product not found', 
        null, 
        ['Product does not exist']
      ));
    }
    
    // Delete product
    const deleted = await Product.delete(id);
    
    if (deleted) {
      res.status(200).json(createResponse(
        true, 
        'Product deleted successfully', 
        null
      ));
    } else {
      res.status(500).json(createResponse(
        false, 
        'Product deletion failed', 
        null, 
        ['Failed to delete product']
      ));
    }
    
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json(createResponse(
      false, 
      'Internal server error', 
      null, 
      ['Product deletion failed due to server error']
    ));
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct
};