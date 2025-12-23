const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const db = require('../config/db');

class User {
  static async create(userData) {
    const { username, email, password, role = 'user' } = userData;
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id,
      username,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date()
    };
    
    await db.getCollection('users').insertOne(user);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async findByEmail(email) {
    return await db.getCollection('users').findOne({ email });
  }

  static async findByUsername(username) {
    return await db.getCollection('users').findOne({ username });
  }

  static async findById(id) {
    return await db.getCollection('users').findOne(
      { id }, 
      { projection: { password: 0 } }
    );
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;