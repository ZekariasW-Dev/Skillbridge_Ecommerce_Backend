const express = require('express');
const router = express.Router();
const { addToFavorites, removeFromFavorites, getFavorites } = require('../controllers/favoritesController');
const { authenticateToken } = require('../middlewares/auth');

// All favorites routes require authentication
router.use(authenticateToken);

// Get user's favorite products
router.get('/', getFavorites);

// Add product to favorites
router.post('/:productId', addToFavorites);

// Remove product from favorites
router.delete('/:productId', removeFromFavorites);

module.exports = router;