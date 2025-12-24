const request = require('supertest');
const express = require('express');

// Mock the database and models
jest.mock('../../src/models/Order');
jest.mock('../../src/models/Product');
jest.mock('../../src/config/db');

const Order = require('../../src/models/Order');
const Product = require('../../src/models/Product');
const db = require('../../src/config/db');
const { createOrder, getMyOrders } = require('../../src/controllers/orderController');
const { globalErrorHandler } = require('../../src/middlewares/errorHandler');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware
const mockAuth = (userId = 'user-uuid-123') => (req, res, next) => {
  req.user = {
    userId: userId,
    username: 'testuser',
    role: 'user'
  };
  next();
};

// Setup routes
app.post('/orders', mockAuth(), createOrder);
app.get('/orders', mockAuth(), getMyOrders);
app.use(globalErrorHandler);

describe('Order Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /orders (Create Order)', () => {
    const validOrderData = {
      description: 'Test order for birthday gift',
      products: [
        {
          productId: 'product-uuid-123',
          quantity: 2
        }
      ]
    };

    const mockProduct = {
      id: 'product-uuid-123',
      name: 'Test Product',
      description: 'Test product description',
      price: 99.99,
      stock: 10,
      category: 'Electronics'
    };

    const mockTransaction = {
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn()
    };

    beforeEach(() => {
      // Mock database transaction
      db.withTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });
    });

    it('should create order successfully with custom description', async () => {
      Product.findByIdWithSession.mockResolvedValue(mockProduct);
      Product.updateStock.mockResolvedValue(true);
      
      const mockOrder = {
        id: 'order-uuid-123',
        userId: 'user-uuid-123',
        description: 'Test order for birthday gift',
        totalPrice: 199.98,
        status: 'pending',
        products: [
          {
            productId: 'product-uuid-123',
            quantity: 2,
            price: 99.99,
            name: 'Test Product',
            description: 'Test product description',
            itemTotal: 199.98
          }
        ],
        createdAt: new Date()
      };

      Order.create.mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/orders')
        .send(validOrderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order placed successfully');
      expect(response.body.object).toHaveProperty('order_id', 'order-uuid-123');
      expect(response.body.object).toHaveProperty('status', 'pending');
      expect(response.body.object).toHaveProperty('total_price', 199.98);
      expect(response.body.object).toHaveProperty('description', 'Test order for birthday gift');
      expect(response.body.object.products).toHaveLength(1);

      expect(Product.findByIdWithSession).toHaveBeenCalledWith('product-uuid-123', mockTransaction);
      expect(Product.updateStock).toHaveBeenCalledWith('product-uuid-123', 2, mockTransaction);
      expect(Order.create).toHaveBeenCalledWith({
        userId: 'user-uuid-123',
        description: 'Test order for birthday gift',
        totalPrice: 199.98,
        status: 'pending',
        products: expect.any(Array)
      }, mockTransaction);
    });

    it('should create order with auto-generated description', async () => {
      Product.findByIdWithSession.mockResolvedValue(mockProduct);
      Product.updateStock.mockResolvedValue(true);
      
      const mockOrder = {
        id: 'order-uuid-123',
        userId: 'user-uuid-123',
        description: 'Order for 2x Test Product',
        totalPrice: 199.98,
        status: 'pending',
        products: [
          {
            productId: 'product-uuid-123',
            quantity: 2,
            price: 99.99,
            name: 'Test Product',
            description: 'Test product description',
            itemTotal: 199.98
          }
        ],
        createdAt: new Date()
      };

      Order.create.mockResolvedValue(mockOrder);

      const orderDataWithoutDescription = {
        products: [
          {
            productId: 'product-uuid-123',
            quantity: 2
          }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .send(orderDataWithoutDescription);

      expect(response.status).toBe(201);
      expect(response.body.object.description).toBe('Order for 2x Test Product');
    });

    it('should return 400 for empty products array', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          products: []
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('array of products');
    });

    it('should return 400 for invalid product data', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          products: [
            {
              productId: 'product-uuid-123',
              quantity: 0 // Invalid quantity
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('positive integer');
    });

    it('should return 400 for invalid description type', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          description: 123, // Should be string
          products: [
            {
              productId: 'product-uuid-123',
              quantity: 1
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('Description must be a string');
    });

    it('should return 400 for description too long', async () => {
      const longDescription = 'A'.repeat(501);
      
      const response = await request(app)
        .post('/orders')
        .send({
          description: longDescription,
          products: [
            {
              productId: 'product-uuid-123',
              quantity: 1
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('500 characters');
    });

    it('should return 404 for non-existent product', async () => {
      Product.findByIdWithSession.mockResolvedValue(null);

      db.withTransaction.mockImplementation(async (callback) => {
        try {
          await callback(mockTransaction);
        } catch (error) {
          if (error.message.startsWith('PRODUCT_NOT_FOUND:')) {
            throw error;
          }
        }
      });

      const response = await request(app)
        .post('/orders')
        .send(validOrderData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('does not exist');
    });

    it('should return 400 for insufficient stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 1 };
      Product.findByIdWithSession.mockResolvedValue(lowStockProduct);

      db.withTransaction.mockImplementation(async (callback) => {
        try {
          await callback(mockTransaction);
        } catch (error) {
          if (error.message.startsWith('INSUFFICIENT_STOCK:')) {
            throw error;
          }
        }
      });

      const response = await request(app)
        .post('/orders')
        .send(validOrderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('Insufficient stock');
    });

    it('should handle multiple products in order', async () => {
      const product1 = { ...mockProduct, id: 'product-1', name: 'Product 1', price: 50.00 };
      const product2 = { ...mockProduct, id: 'product-2', name: 'Product 2', price: 75.00 };

      Product.findByIdWithSession
        .mockResolvedValueOnce(product1)
        .mockResolvedValueOnce(product2);
      Product.updateStock.mockResolvedValue(true);

      const mockOrder = {
        id: 'order-uuid-123',
        userId: 'user-uuid-123',
        description: 'Order for 1x Product 1, 2x Product 2',
        totalPrice: 200.00,
        status: 'pending',
        products: [
          {
            productId: 'product-1',
            quantity: 1,
            price: 50.00,
            name: 'Product 1',
            itemTotal: 50.00
          },
          {
            productId: 'product-2',
            quantity: 2,
            price: 75.00,
            name: 'Product 2',
            itemTotal: 150.00
          }
        ],
        createdAt: new Date()
      };

      Order.create.mockResolvedValue(mockOrder);

      const multiProductOrder = {
        products: [
          { productId: 'product-1', quantity: 1 },
          { productId: 'product-2', quantity: 2 }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .send(multiProductOrder);

      expect(response.status).toBe(201);
      expect(response.body.object.total_price).toBe(200.00);
      expect(response.body.object.products).toHaveLength(2);
    });
  });

  describe('GET /orders (Get My Orders)', () => {
    const mockOrders = [
      {
        id: 'order-1',
        userId: 'user-uuid-123',
        description: 'First order',
        totalPrice: 99.99,
        status: 'pending',
        products: [
          {
            productId: 'product-1',
            quantity: 1,
            price: 99.99,
            name: 'Product 1'
          }
        ],
        createdAt: new Date('2023-01-01')
      },
      {
        id: 'order-2',
        userId: 'user-uuid-123',
        description: 'Second order',
        totalPrice: 149.99,
        status: 'completed',
        products: [
          {
            productId: 'product-2',
            quantity: 1,
            price: 149.99,
            name: 'Product 2'
          }
        ],
        createdAt: new Date('2023-01-02')
      }
    ];

    it('should get user orders successfully', async () => {
      Order.findByUserId.mockResolvedValue(mockOrders);

      const response = await request(app)
        .get('/orders');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Retrieved 2 orders successfully');
      expect(response.body.object).toHaveLength(2);

      // Verify order structure
      const order = response.body.object[0];
      expect(order).toHaveProperty('order_id', 'order-1');
      expect(order).toHaveProperty('status', 'pending');
      expect(order).toHaveProperty('total_price', 99.99);
      expect(order).toHaveProperty('created_at');
      expect(order).toHaveProperty('description', 'First order');
      expect(order).toHaveProperty('products');

      expect(Order.findByUserId).toHaveBeenCalledWith('user-uuid-123');
    });

    it('should return empty array for user with no orders', async () => {
      Order.findByUserId.mockResolvedValue([]);

      const response = await request(app)
        .get('/orders');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('No orders found for this user');
      expect(response.body.object).toHaveLength(0);
    });

    it('should only return orders for authenticated user', async () => {
      const user2Orders = [
        {
          id: 'order-3',
          userId: 'user-uuid-456',
          description: 'User 2 order',
          totalPrice: 199.99,
          status: 'pending',
          products: [],
          createdAt: new Date()
        }
      ];

      // Create app with different user
      const app2 = express();
      app2.use(express.json());
      app2.get('/orders', mockAuth('user-uuid-456'), getMyOrders);
      app2.use(globalErrorHandler);

      Order.findByUserId.mockResolvedValue(user2Orders);

      const response = await request(app2)
        .get('/orders');

      expect(response.status).toBe(200);
      expect(response.body.object).toHaveLength(1);
      expect(response.body.object[0].order_id).toBe('order-3');

      expect(Order.findByUserId).toHaveBeenCalledWith('user-uuid-456');
    });

    it('should handle single order correctly', async () => {
      const singleOrder = [mockOrders[0]];
      Order.findByUserId.mockResolvedValue(singleOrder);

      const response = await request(app)
        .get('/orders');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Retrieved 1 order successfully');
      expect(response.body.object).toHaveLength(1);
    });

    it('should include all required fields in response', async () => {
      Order.findByUserId.mockResolvedValue(mockOrders);

      const response = await request(app)
        .get('/orders');

      expect(response.status).toBe(200);
      
      const order = response.body.object[0];
      
      // Verify all required fields are present (Page 11 PDF requirement)
      expect(order).toHaveProperty('order_id');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('total_price');
      expect(order).toHaveProperty('created_at'); // Page 11 PDF requirement
      expect(order).toHaveProperty('description');
      expect(order).toHaveProperty('products');

      // Verify data types
      expect(typeof order.order_id).toBe('string');
      expect(typeof order.status).toBe('string');
      expect(typeof order.total_price).toBe('number');
      expect(typeof order.created_at).toBe('string');
      expect(typeof order.description).toBe('string');
      expect(Array.isArray(order.products)).toBe(true);
    });
  });
});