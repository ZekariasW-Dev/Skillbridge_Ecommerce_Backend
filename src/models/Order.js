const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

class Order {
  static async create(orderData, session = null) {
    const { userId, description, totalPrice, status = 'pending', products = [] } = orderData;
    const id = uuidv4();
    
    const order = {
      id,
      userId,
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

  static async findById(id) {
    return await db.getCollection('orders').findOne({ id });
  }

  static async findByUserId(userId) {
    return await db.getCollection('orders')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async getOrderWithProducts(orderId) {
    return await db.getCollection('orders').findOne({ id: orderId });
  }
}

module.exports = Order;