const User = require('../models/User');
const Product = require('../models/Product');
const { createResponse } = require('../utils/responses');

/**
 * Add product to favorites
 * POST /favorites/:productId
 */
const addToFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json(createResponse(
        false,
        'Product not found',
        null,
        ['Product does not exist']
      ));
    }

    // Add to favorites
    const success = await User.addToFavorites(userId, productId);
    
    if (success) {
      res.status(200).json(createResponse(
        true,
        'Product added to favorites',
        { productId }
      ));
    } else {
      res.status(400).json(createResponse(
        false,
        'Failed to add to favorites',
        null,
        ['Product may already be in favorites']
      ));
    }
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json(createResponse(
      false,
      'Internal server error',
      null,
      ['Failed to add product to favorites']
    ));
  }
};

/**
 * Remove product from favorites
 * DELETE /favorites/:productId
 */
const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const success = await User.removeFromFavorites(userId, productId);
    
    if (success) {
      res.status(200).json(createResponse(
        true,
        'Product removed from favorites',
        { productId }
      ));
    } else {
      res.status(400).json(createResponse(
        false,
        'Failed to remove from favorites',
        null,
        ['Product may not be in favorites']
      ));
    }
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json(createResponse(
      false,
      'Internal server error',
      null,
      ['Failed to remove product from favorites']
    ));
  }
};

/**
 * Get user's favorite products
 * GET /favorites
 */
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's favorite product IDs
    const favoriteIds = await User.getFavorites(userId);
    
    if (favoriteIds.length === 0) {
      return res.status(200).json(createResponse(
        true,
        'No favorite products found',
        []
      ));
    }

    // Get full product details for favorites
    const favoriteProducts = [];
    for (const productId of favoriteIds) {
      const product = await Product.findById(productId.toString());
      if (product) {
        favoriteProducts.push({
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          images: product.images,
          brand: product.brand,
          rating: product.rating,
          tags: product.tags,
          sku: product.sku,
          createdAt: product.createdAt
        });
      }
    }

    res.status(200).json(createResponse(
      true,
      'Favorite products retrieved successfully',
      favoriteProducts
    ));
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json(createResponse(
      false,
      'Internal server error',
      null,
      ['Failed to retrieve favorite products']
    ));
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites
};