const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const db = require('../../config/database');

class User {
  /**
   * Create a new user
   */
  static async create(userData) {
    const { username, email, password, firstName, lastName, role = 'user' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      createdAt: new Date()
    };
    
    const result = await db.getDb().collection('users').insertOne(user);
    const { password: _, ...userWithoutPassword } = user;
    return { _id: result.insertedId, ...userWithoutPassword };
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    return await db.getDb().collection('users').findOne({ email });
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    return await db.getDb().collection('users').findOne({ username });
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      return await db.getDb().collection('users').findOne({ _id: new ObjectId(id) });
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user role
   */
  static async updateRole(id, role) {
    try {
      const result = await db.getDb().collection('users').updateOne(
        { _id: new ObjectId(id) },
        { $set: { role, updatedAt: new Date() } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Add product to favorites
   */
  static async addToFavorites(userId, productId) {
    try {
      const result = await db.getDb().collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $addToSet: { favorites: new ObjectId(productId) },
          $set: { updatedAt: new Date() }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove product from favorites
   */
  static async removeFromFavorites(userId, productId) {
    try {
      const result = await db.getDb().collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $pull: { favorites: new ObjectId(productId) },
          $set: { updatedAt: new Date() }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user favorites
   */
  static async getFavorites(userId) {
    try {
      const user = await db.getDb().collection('users').findOne(
        { _id: new ObjectId(userId) },
        { projection: { favorites: 1 } }
      );
      return user?.favorites || [];
    } catch (error) {
      return [];
    }
  }
}

module.exports = User;