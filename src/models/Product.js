const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

class Product {
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

  static async findById(id) {
    return await db.getCollection('products').findOne({ id });
  }

  static async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const products = await db.getCollection('products')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const totalSize = await db.getCollection('products').countDocuments(query);
    
    return {
      products,
      totalSize
    };
  }

  static async update(id, updateData) {
    const result = await db.getCollection('products').findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    return result;
  }

  static async delete(id) {
    const result = await db.getCollection('products').deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async updateStock(productId, quantity, session = null) {
    const options = session ? { session } : {};
    
    const result = await db.getCollection('products').updateOne(
      { id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      options
    );
    
    return result.modifiedCount > 0;
  }

  static async findByIdWithSession(id, session) {
    return await db.getCollection('products').findOne({ id }, { session });
  }
}

module.exports = Product;