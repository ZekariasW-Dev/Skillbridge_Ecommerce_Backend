const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const db = require('../config/db');

class User {
  /**
   * Create a new user
   * @param {object} userData - User data object
   * @param {string} userData.username - Username (alphanumeric only)
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Plain text password (will be hashed)
   * @returns {object} - Created user object without password
   */
  static async create(userData) {
    const { username, email, password } = userData;
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    await db.getCollection('users').insertOne(user);
    
    // Return user without password (sensitive information must never be returned)
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Find user by email
   * @param {string} email - Email address
   * @returns {object|null} - User object or null if not found
   */
  static async findByEmail(email) {
    return await db.getCollection('users').findOne({ email });
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {object|null} - User object or null if not found
   */
  static async findByUsername(username) {
    return await db.getCollection('users').findOne({ username });
  }

  /**
   * Find user by ID
   * @param {string} id - User UUID
   * @returns {object|null} - User object without password or null if not found
   */
  static async findById(id) {
    return await db.getCollection('users').findOne(
      { id }, 
      { projection: { password: 0 } }
    );
  }

  /**
   * Validate password against stored hash
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Stored hashed password
   * @returns {boolean} - True if password matches
   */
  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;