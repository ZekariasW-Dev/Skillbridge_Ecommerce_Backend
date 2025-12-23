const Product = require('../models/Product');
const { createResponse, createPaginatedResponse } = require('../utils/responses');
const { validateProduct } = require('../utils/validation');

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const userId = req.user.userId;
    
    // Validation
    const errors = validateProduct({ name, description, price, stock, category });
    
    if (errors.length > 0) {
      return res.status(400).json(createResponse(false, 'Validation failed', null, errors));
    }
    
    // Create product
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      category: category.trim(),
      userId
    });
    
    res.status(201).json(createResponse(true, 'Product created successfully', product));
    
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json(createResponse(false, 'Internal server error', null, ['Product creation failed']));
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    
    // Only include provided fields
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.stock !== undefined) updateData.stock = req.body.stock;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    
    // Validate provided fields
    const errors = validateProduct(updateData);
    
    if (errors.length > 0) {
      return res.status(400).json(createResponse(false, 'Validation failed', null, errors));
    }
    
    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json(createResponse(false, 'Product not found', null, ['Product does not exist']));
    }
    
    // Update product
    const updatedProduct = await Product.update(id, updateData);
    
    res.status(200).json(createResponse(true, 'Product updated successfully', updatedProduct));
    
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json(createResponse(false, 'Internal server error', null, ['Product update failed']));
  }
};

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
    res.status(500).json(createResponse(false, 'Internal server error', null, ['Failed to retrieve products']));
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json(createResponse(false, 'Product not found', null, ['Product does not exist']));
    }
    
    res.status(200).json(createResponse(true, 'Product retrieved successfully', product));
    
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json(createResponse(false, 'Internal server error', null, ['Failed to retrieve product']));
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json(createResponse(false, 'Product not found', null, ['Product does not exist']));
    }
    
    // Delete product
    const deleted = await Product.delete(id);
    
    if (deleted) {
      res.status(200).json(createResponse(true, 'Product deleted successfully', null));
    } else {
      res.status(500).json(createResponse(false, 'Failed to delete product', null, ['Deletion failed']));
    }
    
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json(createResponse(false, 'Internal server error', null, ['Product deletion failed']));
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct
};