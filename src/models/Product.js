const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

class Product {
  /**
   * Create a new product
   * @param {object} productData - Product data object
   * @param {string} productData.name - Product name
   * @param {string} productData.description - Product description
   * @param {number} productData.price - Product price
   * @param {number} productData.stock - Product stock quantity
   * @param {string} productData.category - Product category
   * @param {string} productData.userId - User ID (foreign key)
   * @returns {object} - Created product object
   */
  static async create(productData) {
    const { name, description, price, stock, category, userId } = productData;
    const id = uuidv4();
    
    const product = {
      id,
      name,
      description,
      price,
      stock,
      category,
      userId,
      createdAt: new Date()
    };
    
    await db.getCollection('products').insertOne(product);
    
    return product;
  }

  /**
   * Find product by ID
   * @param {string} id - Product UUID
   * @returns {object|null} - Product object or null if not found
   */
  static async findById(id) {
    return await db.getCollection('products').findOne({ id });
  }

  /**
   * Find all products with pagination (User Story 5)
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {object} - Object containing products array and total count
   */
  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    // Get products for current page
    const products = await db.getCollection('products')
      .find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // Most recent first
      .toArray();
    
    // Get total count of all products
    const totalSize = await db.getCollection('products').countDocuments({});
    
    return {
      products,
      totalSize
    };
  }

  /**
   * Update product by ID
   * @param {string} id - Product UUID
   * @param {object} updateData - Data to update
   * @returns {object|null} - Updated product object or null if not found
   */
  static async update(id, updateData) {
    const result = await db.getCollection('products').findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    return result;
  }

  /**
   * Delete product by ID
   * @param {string} id - Product UUID
   * @returns {boolean} - True if product was deleted
   */
  static async delete(id) {
    const result = await db.getCollection('products').deleteOne({ id });
    return result.deletedCount > 0;
  }

  /**
   * Update product stock (decrease by quantity)
   * @param {string} productId - Product UUID
   * @param {number} quantity - Quantity to decrease
   * @param {object} session - MongoDB session for transactions
   * @returns {boolean} - True if stock was updated successfully
   */
  static async updateStock(productId, quantity, session = null) {
    const options = session ? { session } : {};
    
    const result = await db.getCollection('products').updateOne(
      { id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      options
    );
    
    return result.modifiedCount > 0;
  }

  /**
   * Find product by ID with session (for transactions)
   * @param {string} id - Product UUID
   * @param {object} session - MongoDB session
   * @returns {object|null} - Product object or null if not found
   */
  static async findByIdWithSession(id, session) {
    return await db.getCollection('products').findOne({ id }, { session });
  }
}

module.exports = Product;