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
    this.isMockMode = false;
    this.mockCollections = new Map();
    
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
   * Connect to MongoDB database with fallback to mock mode
   * @returns {Promise<Object>} Database connection
   */
  async connect() {
    try {
      if (this.isConnected && this.db) {
        return this.db;
      }

      console.log('🔗 Connecting to MongoDB...');
      
      // In production, try harder to connect to MongoDB
      const isProduction = config.nodeEnv === 'production';
      const maxRetries = isProduction ? 5 : 1;
      
      for (let retry = 0; retry < maxRetries; retry++) {
        if (retry > 0) {
          console.log(`🔄 Retry attempt ${retry}/${maxRetries - 1} for MongoDB connection...`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between retries
        }
        
        const success = await this.tryMongoDBConnection();
        
        if (success) {
          return this.db;
        }
      }
      
      // If we reach here, all connection attempts failed
      if (isProduction) {
        console.error('❌ CRITICAL: MongoDB connection failed in production after all retries');
        console.error('💡 Check MongoDB Atlas network access and connection string');
        throw new Error('MongoDB connection failed in production environment');
      } else {
        // Only use mock mode in development
        console.log('🔄 Falling back to mock database mode for development...');
        return this.initializeMockMode();
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      
      // In production, don't fall back to mock mode - throw the error
      if (config.nodeEnv === 'production') {
        throw error;
      }
      
      // In development, use mock mode as fallback
      console.log('🔄 Using mock database mode for development...');
      return this.initializeMockMode();
    }
  }

  /**
   * Try to connect to MongoDB with multiple strategies
   * @returns {Promise<boolean>} Success status
   */
  async tryMongoDBConnection() {
    const connectionStrategies = [
      // Strategy 1: Production-optimized connection
      {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority',
        ssl: true,
        authSource: 'admin'
      },
      // Strategy 2: Alternative SSL configuration
      {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority',
        tls: true,
        tlsInsecure: false
      },
      // Strategy 3: Minimal but reliable
      {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        retryWrites: true
      },
      // Strategy 4: Legacy compatibility
      {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 25000,
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    ];
    
    for (let i = 0; i < connectionStrategies.length; i++) {
      try {
        console.log(`🔄 Trying connection strategy ${i + 1}/${connectionStrategies.length}...`);
        
        // For production, try with modified URI that includes SSL parameters
        let connectionUri = this.config.uri;
        if (config.nodeEnv === 'production' && i === 0) {
          // Add SSL parameters to URI for first strategy in production
          connectionUri = this.config.uri.includes('?') 
            ? `${this.config.uri}&ssl=true&authSource=admin`
            : `${this.config.uri}?ssl=true&authSource=admin`;
        }
        
        this.client = new MongoClient(connectionUri, connectionStrategies[i]);
        await this.client.connect();
        
        // Get database name from URI or use default
        const dbName = this.extractDatabaseName(this.config.uri) || 'ecommerce';
        this.db = this.client.db(dbName);
        
        // Test connection
        await this.db.admin().ping();
        
        this.isConnected = true;
        console.log(`✅ Connected to MongoDB successfully using strategy ${i + 1}`);
        
        // Create indexes
        await this.createIndexes();
        
        return true;
      } catch (error) {
        console.log(`❌ Strategy ${i + 1} failed: ${error.message}`);
        
        // Clean up failed connection
        if (this.client) {
          try {
            await this.client.close();
          } catch (closeError) {
            // Ignore close errors
          }
          this.client = null;
        }
      }
    }
    
    return false;
  }

  /**
   * Initialize mock database mode for development
   * @returns {Object} Mock database interface
   */
  initializeMockMode() {
    console.log('🎭 Initializing mock database mode...');
    console.log('💡 This is a development fallback - data will not persist');
    console.log('💡 To use real MongoDB, fix the SSL/TLS connection issue');
    
    this.isMockMode = true;
    this.isConnected = true;
    
    // Create mock database interface
    this.db = {
      collection: (name) => this.getMockCollection(name),
      admin: () => ({
        ping: async () => ({ ok: 1 })
      })
    };
    
    console.log('✅ Mock database initialized successfully');
    return this.db;
  }

  /**
   * Get or create a mock collection
   * @param {string} name - Collection name
   * @returns {Object} Mock collection interface
   */
  getMockCollection(name) {
    if (!this.mockCollections.has(name)) {
      const collection = {
        data: [],
        indexes: [],
        
        // Mock collection methods
        insertOne: async (doc) => {
          const id = Date.now().toString();
          const newDoc = { _id: id, ...doc };
          collection.data.push(newDoc);
          return { insertedId: id, acknowledged: true };
        },
        
        insertMany: async (docs) => {
          const insertedIds = [];
          docs.forEach(doc => {
            const id = Date.now().toString() + Math.random();
            const newDoc = { _id: id, ...doc };
            collection.data.push(newDoc);
            insertedIds.push(id);
          });
          return { insertedIds, acknowledged: true };
        },
        
        findOne: async (query = {}) => {
          return collection.data.find(doc => this.matchesQuery(doc, query)) || null;
        },
        
        find: (query = {}) => ({
          toArray: async () => collection.data.filter(doc => this.matchesQuery(doc, query)),
          limit: (n) => ({
            toArray: async () => collection.data.filter(doc => this.matchesQuery(doc, query)).slice(0, n)
          }),
          sort: (sortObj) => ({
            toArray: async () => {
              const filtered = collection.data.filter(doc => this.matchesQuery(doc, query));
              return filtered.sort((a, b) => {
                for (const [key, order] of Object.entries(sortObj)) {
                  if (a[key] < b[key]) return order === 1 ? -1 : 1;
                  if (a[key] > b[key]) return order === 1 ? 1 : -1;
                }
                return 0;
              });
            }
          })
        }),
        
        updateOne: async (query, update) => {
          const doc = collection.data.find(doc => this.matchesQuery(doc, query));
          if (doc) {
            Object.assign(doc, update.$set || {});
            return { matchedCount: 1, modifiedCount: 1, acknowledged: true };
          }
          return { matchedCount: 0, modifiedCount: 0, acknowledged: true };
        },
        
        deleteOne: async (query) => {
          const index = collection.data.findIndex(doc => this.matchesQuery(doc, query));
          if (index !== -1) {
            collection.data.splice(index, 1);
            return { deletedCount: 1, acknowledged: true };
          }
          return { deletedCount: 0, acknowledged: true };
        },
        
        createIndex: async (indexSpec, options = {}) => {
          collection.indexes.push({ spec: indexSpec, options });
          return 'mock_index_' + collection.indexes.length;
        },
        
        countDocuments: async (query = {}) => {
          return collection.data.filter(doc => this.matchesQuery(doc, query)).length;
        }
      };
      
      this.mockCollections.set(name, collection);
    }
    
    return this.mockCollections.get(name);
  }

  /**
   * Simple query matching for mock collections
   * @param {Object} doc - Document to test
   * @param {Object} query - Query object
   * @returns {boolean} Whether document matches query
   */
  matchesQuery(doc, query) {
    for (const [key, value] of Object.entries(query)) {
      if (doc[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Test database connection with retry logic
   */
  async testConnection(retries = 3) {
    if (this.isMockMode) {
      return; // Mock mode is always "connected"
    }
    
    for (let i = 0; i < retries; i++) {
      try {
        await this.db.admin().ping();
        return;
      } catch (error) {
        console.log(`🔄 Connection test attempt ${i + 1}/${retries} failed, retrying...`);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      }
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
      
      // Order indexes
      await this.db.collection('orders').createIndex({ userId: 1 });
      await this.db.collection('orders').createIndex({ createdAt: -1 });
      
      if (!this.isMockMode) {
        // Text search index (only for real MongoDB)
        await this.db.collection('products').createIndex({ 
          name: 'text', 
          description: 'text', 
          category: 'text' 
        });
      }
      
      console.log('📊 Database indexes created successfully');
    } catch (error) {
      console.error('⚠️ Index creation warning:', error.message);
    }
  }

  /**
   * Execute database transaction (mock mode doesn't support transactions)
   * @param {Function} operations - Transaction operations
   * @returns {Promise<any>} Transaction result
   */
  async withTransaction(operations) {
    if (this.isMockMode) {
      // Mock mode: just execute operations without transaction
      console.log('⚠️ Mock mode: executing operations without transaction support');
      return await operations(null);
    }
    
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
      if (this.isMockMode) {
        this.mockCollections.clear();
        console.log('👋 Mock database cleared');
      } else if (this.client) {
        await this.client.close();
        console.log('👋 Disconnected from MongoDB');
      }
      
      this.isConnected = false;
      this.isMockMode = false;
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error.message);
    }
  }

  /**
   * Get database connection status
   * @returns {boolean} Connection status
   */
  isHealthy() {
    return this.isConnected && (this.isMockMode || (this.client && this.db));
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