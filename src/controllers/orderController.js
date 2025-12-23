const Order = require('../models/Order');
const Product = require('../models/Product');
const db = require('../config/db');
const { createResponse } = require('../utils/responses');

/**
 * Place a New Order endpoint - User Story 9
 * POST /orders
 * 
 * Acceptance Criteria:
 * 1. POST request with array of products (productId and quantity for each)
 * 2. Protected endpoint - only authenticated users with 'User' role can access
 * 3. Business Logic: verify stock, handle in database transaction, calculate total_price on backend
 * 4. Success: 201 Created with order details (order_id, status, total_price, products)
 * 5. Failure: 400 Bad Request for insufficient stock, 404 Not Found for non-existent products
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token (authenticated user)
    const orderItems = req.body;
    
    // Validate request body format (User Story 9 requirement)
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json(createResponse(
        false, 
        'Order placement failed', 
        null, 
        ['Order must contain an array of products with productId and quantity']
      ));
    }
    
    // Validate each order item (User Story 9 requirement)
    const validationErrors = [];
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      
      if (!item.productId || typeof item.productId !== 'string' || item.productId.trim().length === 0) {
        validationErrors.push(`Item ${i + 1}: productId is required and must be a valid string`);
      }
      
      if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        validationErrors.push(`Item ${i + 1}: quantity must be a positive integer`);
      }
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json(createResponse(
        false, 
        'Order validation failed', 
        null, 
        validationErrors
      ));
    }
    
    // Handle entire order placement in database transaction (User Story 9 requirement)
    const result = await db.withTransaction(async (session) => {
      let totalPrice = 0;
      const orderProducts = [];
      
      // Verify products exist and check stock for each item (User Story 9 requirement)
      for (const item of orderItems) {
        const product = await Product.findByIdWithSession(item.productId.trim(), session);
        
        // Handle non-existent product (User Story 9 requirement - 404 Not Found)
        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND:Product with ID ${item.productId} does not exist`);
        }
        
        // Verify sufficient stock (User Story 9 requirement - 400 Bad Request)
        if (product.stock < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
        
        // Calculate total_price on backend using database prices (User Story 9 requirement)
        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;
        
        orderProducts.push({
          productId: item.productId.trim(),
          quantity: item.quantity,
          price: product.price, // Use price from database, not client
          name: product.name,
          description: product.description,
          itemTotal: itemTotal
        });
      }
      
      // Update stock for all products within transaction (User Story 9 requirement)
      for (const item of orderProducts) {
        const stockUpdated = await Product.updateStock(item.productId, item.quantity, session);
        if (!stockUpdated) {
          throw new Error(`STOCK_UPDATE_FAILED:Failed to update stock for ${item.name}`);
        }
      }
      
      // Create order with calculated total_price (User Story 9 requirement)
      const order = await Order.create({
        userId,
        description: `Order with ${orderItems.length} product${orderItems.length > 1 ? 's' : ''}`,
        totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
        status: 'pending', // Default status as per User Story 9
        products: orderProducts
      }, session);
      
      // Return order details as specified in User Story 9
      return {
        order_id: order.id, // User Story 9 uses 'order_id'
        status: order.status,
        total_price: order.totalPrice, // User Story 9 uses 'total_price'
        userId: order.userId,
        createdAt: order.createdAt,
        products: orderProducts.map(item => ({
          productId: item.productId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          itemTotal: item.itemTotal
        }))
      };
    });
    
    // Return 201 Created with order details (User Story 9 requirement)
    res.status(201).json(createResponse(
      true, 
      'Order placed successfully', 
      result
    ));
    
  } catch (error) {
    console.error('Create order error:', error);
    
    // Handle specific error types as per User Story 9 requirements
    if (error.message.startsWith('PRODUCT_NOT_FOUND:')) {
      const errorMsg = error.message.replace('PRODUCT_NOT_FOUND:', '');
      return res.status(404).json(createResponse(
        false, 
        'Product not found', 
        null, 
        [errorMsg]
      ));
    }
    
    if (error.message.startsWith('INSUFFICIENT_STOCK:')) {
      const errorMsg = error.message.replace('INSUFFICIENT_STOCK:', '');
      return res.status(400).json(createResponse(
        false, 
        'Insufficient stock', 
        null, 
        [errorMsg]
      ));
    }
    
    if (error.message.startsWith('STOCK_UPDATE_FAILED:')) {
      const errorMsg = error.message.replace('STOCK_UPDATE_FAILED:', '');
      return res.status(400).json(createResponse(
        false, 
        'Stock update failed', 
        null, 
        [errorMsg]
      ));
    }
    
    // Handle transaction rollback and other errors
    res.status(500).json(createResponse(
      false, 
      'Internal server error', 
      null, 
      ['Order placement failed due to server error']
    ));
  }
};

/**
 * Get My Orders endpoint - User Story 10 (View Order History)
 * GET /orders
 */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const orders = await Order.findByUserId(userId);
    
    // Format orders with consistent field names
    const ordersWithProducts = orders.map(order => ({
      order_id: order.id,
      userId: order.userId,
      description: order.description,
      total_price: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      products: order.products || []
    }));
    
    res.status(200).json(createResponse(
      true, 
      'Orders retrieved successfully', 
      ordersWithProducts
    ));
    
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json(createResponse(
      false, 
      'Internal server error', 
      null, 
      ['Failed to retrieve orders']
    ));
  }
};

module.exports = {
  createOrder,
  getMyOrders
};