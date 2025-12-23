const Order = require('../models/Order');
const Product = require('../models/Product');
const db = require('../config/db');
const { createResponse } = require('../utils/responses');

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderItems = req.body;
    
    // Validation
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json(createResponse(false, 'Order items are required', null, ['Invalid order format']));
    }
    
    const errors = [];
    for (const item of orderItems) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        errors.push('Each item must have productId and positive quantity');
        break;
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json(createResponse(false, 'Validation failed', null, errors));
    }
    
    // Use MongoDB transaction
    const result = await db.withTransaction(async (session) => {
      let totalPrice = 0;
      const orderProducts = [];
      
      // Verify products and calculate total
      for (const item of orderItems) {
        const product = await Product.findByIdWithSession(item.productId, session);
        
        if (!product) {
          throw new Error(`Product ${item.productId} does not exist`);
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for product ${product.name}`);
        }
        
        totalPrice += product.price * item.quantity;
        orderProducts.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          name: product.name,
          description: product.description
        });
      }
      
      // Update stock for all products
      for (const item of orderProducts) {
        const stockUpdated = await Product.updateStock(item.productId, item.quantity, session);
        if (!stockUpdated) {
          throw new Error('Insufficient stock during processing');
        }
      }
      
      // Create order with products embedded
      const order = await Order.create({
        userId,
        description: `Order with ${orderItems.length} items`,
        totalPrice,
        status: 'pending',
        products: orderProducts
      }, session);
      
      return {
        id: order.id,
        status: order.status,
        totalPrice: order.totalPrice,
        products: orderProducts.map(item => ({
          productId: item.productId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: item.price
        }))
      };
    });
    
    res.status(201).json(createResponse(true, 'Order created successfully', result));
    
  } catch (error) {
    console.error('Create order error:', error);
    
    if (error.message.includes('does not exist')) {
      return res.status(404).json(createResponse(false, 'Product not found', null, [error.message]));
    }
    
    if (error.message.includes('stock')) {
      return res.status(400).json(createResponse(false, 'Insufficient stock', null, [error.message]));
    }
    
    res.status(500).json(createResponse(false, 'Internal server error', null, ['Order creation failed']));
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const orders = await Order.findByUserId(userId);
    
    // Orders already contain embedded products in MongoDB version
    const ordersWithProducts = orders.map(order => ({
      id: order.id,
      userId: order.userId,
      description: order.description,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      products: order.products || []
    }));
    
    res.status(200).json(createResponse(true, 'Orders retrieved successfully', ordersWithProducts));
    
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json(createResponse(false, 'Internal server error', null, ['Failed to retrieve orders']));
  }
};

module.exports = {
  createOrder,
  getMyOrders
};