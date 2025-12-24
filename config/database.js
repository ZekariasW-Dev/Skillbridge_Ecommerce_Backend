/**
 * Database Configuration
 * Centralized database connection and configuration management
 * 
 * @author E-commerce API Team
 * @version 1.0.0
 * @since 2023-12-25
 */

const { MongoClient } = require('mongodb');

// Load environment configuration
const { config } = require('./environment');

class DatabaseConfig {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    
    // Connection configuration
    this.config = {
      uri: config.mongoUri,
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority'
      }
    };
  }

  /**
   * Connect to MongoDB database
   * @returns {Promise<Object>} Database connection
   */
  async connect() {
    try {
      if (this.isConnected && this.db) {
        return this.db;
      }

      console.log('🔗 Connecting to MongoDB...');
      
      this.client = new MongoClient(this.config.uri, this.config.options);
      await this.client.connect();
      
      // Get database name from URI or use default
      const dbName = this.extractDatabaseName(this.config.uri) || 'ecommerce';
      this.db = this.client.db(dbName);
      
      // Test connection
      await this.db.admin().ping();
      
      this.isConnected = true;
      console.log('✅ Connected to MongoDB successfully');
      
      // Create indexes
      await this.createIndexes();
      
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Create database indexes for optimal performance
   */
  async createIndexes() {
    try {
      // User indexes
      await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await this.db.collection('users').createIndex({ username: 1 }, { unique: true });
      
      // Product indexes
      await this.db.collection('products').createIndex({ name: 1 });
      await this.db.collection('products').createIndex({ category: 1 });
      await this.db.collection('products').createIndex({ price: 1 });
      await this.db.collection('products').createIndex({ 
        name: 'text', 
        description: 'text', 
        category: 'text' 
      });
      
      // Order indexes
      await this.db.collection('orders').createIndex({ userId: 1 });
      await this.db.collection('orders').createIndex({ createdAt: -1 });
      
      console.log('📊 Database indexes created successfully');
    } catch (error) {
      console.error('⚠️ Index creation warning:', error.message);
    }
  }

  /**
   * Execute database transaction
   * @param {Function} operations - Transaction operations
   * @returns {Promise<any>} Transaction result
   */
  async withTransaction(operations) {
    const session = this.client.startSession();
    
    try {
      return await session.withTransaction(async () => {
        return await operations(session);
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Close database connection
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        this.isConnected = false;
        console.log('👋 Disconnected from MongoDB');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }

  /**
   * Get database connection status
   * @returns {boolean} Connection status
   */
  isHealthy() {
    return this.isConnected && this.client && this.db;
  }

  /**
   * Extract database name from MongoDB URI
   * @param {string} uri - MongoDB connection URI
   * @returns {string|null} Database name
   */
  extractDatabaseName(uri) {
    try {
      const match = uri.match(/\/([^/?]+)(\?|$)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
const databaseConfig = new DatabaseConfig();

module.exports = {
  connect: () => databaseConfig.connect(),
  withTransaction: (operations) => databaseConfig.withTransaction(operations),
  disconnect: () => databaseConfig.disconnect(),
  isHealthy: () => databaseConfig.isHealthy(),
  getDb: () => databaseConfig.db
};