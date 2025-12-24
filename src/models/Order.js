const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

class Order {
  /**
   * Create a new order
   * @param {object} orderData - Order data object
   * @param {string} orderData.UserId - User ID (foreign key) - Page 2 PDF Requirement: UserId casing
   * @param {string} orderData.description - Order description
   * @param {number} orderData.totalPrice - Total price of the order
   * @param {string} orderData.status - Order status
   * @param {array} orderData.products - List of ordered products
   * @param {object} session - MongoDB session for transactions
   * @returns {object} - Created order object
   */
  static async create(orderData, session = null) {
    const { UserId, description, totalPrice, status, products = [] } = orderData;
    const id = uuidv4();
    
    const order = {
      id,
      UserId,  // Page 2 PDF Requirement: UserId field (capital U, lowercase i)
      description,
      totalPrice,
      status,
      products,
      createdAt: new Date()
    };
    
    const options = session ? { session } : {};
    await db.getCollection('orders').insertOne(order, options);
    
    return order;
  }

  /**
   * Find order by ID
   * @param {string} id - Order UUID
   * @returns {object|null} - Order object or null if not found
   */
  static async findById(id) {
    return await db.getCollection('orders').findOne({ id });
  }

  /**
   * Find all orders for a specific user
   * @param {string} UserId - User UUID (Page 2 PDF Requirement: UserId casing)
   * @returns {array} - Array of order objects
   */
  static async findByUserId(UserId) {
    return await db.getCollection('orders')
      .find({ UserId })  // Page 2 PDF Requirement: UserId field
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Get order with products (same as findById since products are embedded)
   * @param {string} orderId - Order UUID
   * @returns {object|null} - Order object with products or null if not found
   */
  static async getOrderWithProducts(orderId) {
    return await db.getCollection('orders').findOne({ id: orderId });
  }
}

module.exports = Order;