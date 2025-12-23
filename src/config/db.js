const { MongoClient } = require('mongodb');

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI || "mongodb+srv://zekarias:zack%40123@cluster0.j4lbgu9.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Ecommerce_platform_backend";
      this.client = new MongoClient(uri);
      await this.client.connect();
      
      // Use the database name from the connection or default
      this.db = this.client.db('ecommerce');
      
      console.log('Connected to MongoDB Atlas database');
      await this.createIndexes();
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Create unique indexes for users
      await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await this.db.collection('users').createIndex({ username: 1 }, { unique: true });
      
      // Create indexes for products
      await this.db.collection('products').createIndex({ name: 1 });
      await this.db.collection('products').createIndex({ category: 1 });
      await this.db.collection('products').createIndex({ userId: 1 });
      
      // Create indexes for orders
      await this.db.collection('orders').createIndex({ userId: 1 });
      await this.db.collection('orders').createIndex({ createdAt: -1 });
      
      console.log('Database indexes created');
    } catch (error) {
      // Ignore duplicate key errors for existing indexes
      if (error.code !== 11000) {
        console.error('Error creating indexes:', error);
      }
    }
  }

  getCollection(name) {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection(name);
  }

  async startSession() {
    return this.client.startSession();
  }

  async withTransaction(callback) {
    const session = await this.startSession();
    try {
      return await session.withTransaction(callback);
    } finally {
      await session.endSession();
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('Database connection closed');
    }
  }
}

module.exports = new Database();