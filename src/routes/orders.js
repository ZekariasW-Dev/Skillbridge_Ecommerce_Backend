const express = require('express');
const { createOrder, getMyOrders } = require('../controllers/orderController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Authenticated user routes
router.post('/', authenticateToken, createOrder);
router.get('/', authenticateToken, getMyOrders);

module.exports = router;