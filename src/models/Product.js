const { ObjectId } = require('mongodb');
const db = require('../../config/database');

class Product {
  /**
   * Create a new product
   */
  static async create(productData) {
    const { name, description, price, stock, category, userId } = productData;
    
    const product = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.getDb().collection('products').insertOne(product);
    return { _id: result.insertedId, ...product };
  }

  /**
   * Find product by ID
   */
  static async findById(id) {
    try {
      return await db.getDb().collection('products').findOne({ _id: new ObjectId(id) });
    } catch (error) {
      return null;
    }
  }

  /**
   * Find all products with pagination, search, category filter, and sorting
   */
  static async findAll(page = 1, limit = 10, search = '', category = '', sort = '') {
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Search filter
    if (search && search.trim().length > 0) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }
    
    // Category filter
    if (category && category.trim().length > 0) {
      query.category = category.trim();
    }
    
    // Build sort object
    let sortObj = { createdAt: -1 }; // Default sort by newest
    
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortObj = { price: 1 };
          break;
        case 'price_desc':
          sortObj = { price: -1 };
          break;
        case 'name_asc':
          sortObj = { name: 1 };
          break;
        case 'name_desc':
          sortObj = { name: -1 };
          break;
        case 'rating_desc':
          sortObj = { 'rating.average': -1 };
          break;
        default:
          sortObj = { createdAt: -1 };
      }
    }
    
    // Get products with filters and sorting
    const products = await db.getDb().collection('products')
      .find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Get total count with filters applied
    const totalSize = await db.getDb().collection('products').countDocuments(query);
    
    return { products, totalSize };
  }

  /**
   * Update product by ID
   */
  static async update(id, updateData) {
    try {
      const result = await db.getDb().collection('products').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result;
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete product by ID
   */
  static async delete(id) {
    try {
      const result = await db.getDb().collection('products').deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update product stock
   */
  static async updateStock(productId, quantity, session = null) {
    try {
      const options = session ? { session } : {};
      const result = await db.getDb().collection('products').updateOne(
        { _id: new ObjectId(productId), stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        options
      );
      return result.modifiedCount > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Find product by ID with session
   */
  static async findByIdWithSession(id, session) {
    try {
      return await db.getDb().collection('products').findOne({ _id: new ObjectId(id) }, { session });
    } catch (error) {
      return null;
    }
  }
}

module.exports = Product;