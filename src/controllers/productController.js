const Product = require('../models/Product');
const { createResponse, createPaginatedResponse } = require('../utils/responses');
const { validateProduct } = require('../utils/validation');

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
 * Update Product endpoint
 * PUT /products/:id
 * Admin only
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    
    // Only include provided fields for partial updates
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.stock !== undefined) updateData.stock = req.body.stock;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    
    // Validate provided fields
    const validationErrors = validateProduct(updateData);
    
    if (validationErrors.length > 0) {
      return res.status(400).json(createResponse(
        false, 
        'Product update failed', 
        null, 
        validationErrors
      ));
    }
    
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
    
    // Update product
    const updatedProduct = await Product.update(id, updateData);
    
    res.status(200).json(createResponse(
      true, 
      'Product updated successfully', 
      updatedProduct
    ));
    
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json(createResponse(
      false, 
      'Internal server error', 
      null, 
      ['Product update failed due to server error']
    ));
  }
};

/**
 * Get All Products endpoint (Public)
 * GET /products
 */
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit || req.query.pageSize) || 10;
    const search = req.query.search || '';
    
    const result = await Product.findAll(page, limit, search);
    
    res.status(200).json(createPaginatedResponse(
      true,
      'Products retrieved successfully',
      result.products,
      page,
      limit,
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
 * Get Product by ID endpoint (Public)
 * GET /products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json(createResponse(
        false, 
        'Product not found', 
        null, 
        ['Product does not exist']
      ));
    }
    
    res.status(200).json(createResponse(
      true, 
      'Product retrieved successfully', 
      product
    ));
    
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json(createResponse(
      false, 
      'Internal server error', 
      null, 
      ['Failed to retrieve product']
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