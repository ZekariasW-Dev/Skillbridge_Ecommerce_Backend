const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock the database and models
jest.mock('../../src/models/Product');
jest.mock('../../src/config/db');

const Product = require('../../src/models/Product');
const { 
  createProduct, 
  updateProduct, 
  getAllProducts, 
  getProductById, 
  deleteProduct 
} = require('../../src/controllers/productController');
const { authenticateToken, requireAdmin } = require('../../src/middlewares/auth');
const { globalErrorHandler } = require('../../src/middlewares/errorHandler');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware
const mockAuth = (role = 'user') => (req, res, next) => {
  req.user = {
    userId: 'user-uuid-123',
    username: 'testuser',
    role: role
  };
  next();
};

// Setup routes
app.post('/products', mockAuth('admin'), createProduct);
app.put('/products/:id', mockAuth('admin'), updateProduct);
app.get('/products', getAllProducts);
app.get('/products/:id', getProductById);
app.delete('/products/:id', mockAuth('admin'), deleteProduct);
app.use(globalErrorHandler);

// Mock JWT_SECRET
process.env.JWT_SECRET = 'test-secret-key';

describe('Product Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /products (Create Product)', () => {
    const validProductData = {
      name: 'Test Product',
      description: 'This is a test product description',
      price: 99.99,
      stock: 10,
      category: 'Electronics'
    };

    it('should create a product successfully', async () => {
      const mockProduct = {
        id: 'product-uuid-123',
        ...validProductData,
        userId: 'user-uuid-123',
        createdAt: new Date()
      };

      Product.create.mockResolvedValue(mockProduct);

      const response = await request(app)
        .post('/products')
        .send(validProductData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.object).toHaveProperty('id', 'product-uuid-123');
      expect(response.body.object).toHaveProperty('name', 'Test Product');
      expect(response.body.object).toHaveProperty('price', 99.99);

      expect(Product.create).toHaveBeenCalledWith({
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        stock: 10,
        category: 'Electronics',
        userId: 'user-uuid-123'
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          name: 'Test Product'
          // Missing other required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Product description is required');
    });

    it('should return 400 for invalid product name (too short)', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          ...validProductData,
          name: 'AB' // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('between 3 and 100 characters');
    });

    it('should return 400 for invalid price (negative)', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          ...validProductData,
          price: -10
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('positive number greater than 0');
    });

    it('should return 400 for invalid stock (negative)', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          ...validProductData,
          stock: -5
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('non-negative integer');
    });

    it('should trim whitespace from string fields', async () => {
      const mockProduct = {
        id: 'product-uuid-123',
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        stock: 10,
        category: 'Electronics',
        userId: 'user-uuid-123',
        createdAt: new Date()
      };

      Product.create.mockResolvedValue(mockProduct);

      const response = await request(app)
        .post('/products')
        .send({
          name: '  Test Product  ',
          description: '  This is a test product description  ',
          price: 99.99,
          stock: 10,
          category: '  Electronics  '
        });

      expect(response.status).toBe(201);
      expect(Product.create).toHaveBeenCalledWith({
        name: 'Test Product',
        description: 'This is a test product description',
        price: 99.99,
        stock: 10,
        category: 'Electronics',
        userId: 'user-uuid-123'
      });
    });
  });

  describe('PUT /products/:id (Update Product)', () => {
    const productId = 'product-uuid-123';
    const updateData = {
      name: 'Updated Product',
      price: 149.99
    };

    it('should update a product successfully', async () => {
      const existingProduct = {
        id: productId,
        name: 'Old Product',
        description: 'Old description',
        price: 99.99,
        stock: 10,
        category: 'Electronics'
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateData
      };

      Product.findById.mockResolvedValue(existingProduct);
      Product.update.mockResolvedValue(updatedProduct);

      const response = await request(app)
        .put(`/products/${productId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product updated successfully');
      expect(response.body.object).toHaveProperty('name', 'Updated Product');
      expect(response.body.object).toHaveProperty('price', 149.99);

      expect(Product.findById).toHaveBeenCalledWith(productId);
      expect(Product.update).toHaveBeenCalledWith(productId, {
        name: 'Updated Product',
        price: 149.99
      });
    });

    it('should return 404 for non-existent product', async () => {
      Product.findById.mockResolvedValue(null);

      const response = await request(app)
        .put(`/products/${productId}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('does not exist');
    });

    it('should return 400 for no fields to update', async () => {
      const response = await request(app)
        .put(`/products/${productId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('At least one field must be provided');
    });

    it('should validate partial update fields', async () => {
      const response = await request(app)
        .put(`/products/${productId}`)
        .send({
          price: -10 // Invalid price
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('positive number greater than 0');
    });
  });

  describe('GET /products (Get All Products)', () => {
    it('should get all products with default pagination', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Product 1',
          description: 'Description 1',
          price: 99.99,
          stock: 10,
          category: 'Electronics',
          createdAt: new Date()
        },
        {
          id: 'product-2',
          name: 'Product 2',
          description: 'Description 2',
          price: 149.99,
          stock: 5,
          category: 'Electronics',
          createdAt: new Date()
        }
      ];

      Product.findAll.mockResolvedValue({
        products: mockProducts,
        totalSize: 2
      });

      const response = await request(app)
        .get('/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Products retrieved successfully');
      expect(response.body.products).toHaveLength(2);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.totalProducts).toBe(2);

      expect(Product.findAll).toHaveBeenCalledWith(1, 10, '');
    });

    it('should get products with custom pagination', async () => {
      Product.findAll.mockResolvedValue({
        products: [],
        totalSize: 0
      });

      const response = await request(app)
        .get('/products?page=2&pageSize=5');

      expect(response.status).toBe(200);
      expect(Product.findAll).toHaveBeenCalledWith(2, 5, '');
    });

    it('should search products', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'iPhone 15',
          description: 'Latest iPhone',
          price: 999.99,
          stock: 10,
          category: 'Electronics',
          createdAt: new Date()
        }
      ];

      Product.findAll.mockResolvedValue({
        products: mockProducts,
        totalSize: 1
      });

      const response = await request(app)
        .get('/products?search=iPhone');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Products matching "iPhone" retrieved successfully');
      expect(Product.findAll).toHaveBeenCalledWith(1, 10, 'iPhone');
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/products?page=0');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('Page number must be 1 or greater');
    });

    it('should return 400 for invalid page size', async () => {
      const response = await request(app)
        .get('/products?pageSize=200');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('between 1 and 100');
    });
  });

  describe('GET /products/:id (Get Product by ID)', () => {
    const productId = 'product-uuid-123';

    it('should get product by ID successfully', async () => {
      const mockProduct = {
        id: productId,
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        stock: 10,
        category: 'Electronics',
        userId: 'user-uuid-123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      Product.findById.mockResolvedValue(mockProduct);

      const response = await request(app)
        .get(`/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product details retrieved successfully');
      expect(response.body.object).toHaveProperty('id', productId);
      expect(response.body.object).toHaveProperty('name', 'Test Product');

      expect(Product.findById).toHaveBeenCalledWith(productId);
    });

    it('should return 404 for non-existent product', async () => {
      Product.findById.mockResolvedValue(null);

      const response = await request(app)
        .get(`/products/${productId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Product not found');
    });

    it('should return 400 for empty product ID', async () => {
      const response = await request(app)
        .get('/products/ ');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('Product ID is required');
    });
  });

  describe('DELETE /products/:id (Delete Product)', () => {
    const productId = 'product-uuid-123';

    it('should delete product successfully', async () => {
      const existingProduct = {
        id: productId,
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        stock: 10,
        category: 'Electronics'
      };

      Product.findById.mockResolvedValue(existingProduct);
      Product.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete(`/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product deleted successfully');
      expect(response.body.object).toHaveProperty('deletedProductId', productId);
      expect(response.body.object).toHaveProperty('deletedProductName', 'Test Product');

      expect(Product.findById).toHaveBeenCalledWith(productId);
      expect(Product.delete).toHaveBeenCalledWith(productId);
    });

    it('should return 404 for non-existent product', async () => {
      Product.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/products/${productId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('does not exist');
    });

    it('should return 400 for empty product ID', async () => {
      const response = await request(app)
        .delete('/products/ ');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('Product ID is required');
    });

    it('should handle deletion failure', async () => {
      const existingProduct = {
        id: productId,
        name: 'Test Product'
      };

      Product.findById.mockResolvedValue(existingProduct);
      Product.delete.mockResolvedValue(false);

      const response = await request(app)
        .delete(`/products/${productId}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('Failed to delete product');
    });
  });
});