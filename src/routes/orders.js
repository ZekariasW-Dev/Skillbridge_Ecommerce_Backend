const express = require('express');
const { createOrder, getMyOrders } = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/auth');
const { orderLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Authenticated user routes with order rate limiting
router.post('/', orderLimiter, authenticateToken, createOrder);
router.get('/', authenticateToken, getMyOrders);

module.exports = router;