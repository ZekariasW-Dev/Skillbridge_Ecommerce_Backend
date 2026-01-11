const express = require('express');
const { createOrder, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { orderLimiter, adminLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Authenticated user routes with order rate limiting
router.post('/', orderLimiter, authenticateToken, createOrder);
router.get('/', authenticateToken, getMyOrders);

// Admin only routes
router.patch('/:id/status', adminLimiter, authenticateToken, requireAdmin, updateOrderStatus);

module.exports = router;