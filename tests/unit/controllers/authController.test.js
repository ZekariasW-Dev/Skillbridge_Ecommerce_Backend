const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Mock the database and models
jest.mock('../../src/models/User');
jest.mock('../../src/config/db');

const User = require('../../src/models/User');
const { register, login } = require('../../src/controllers/authController');
const { globalErrorHandler } = require('../../src/middlewares/errorHandler');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.post('/auth/register', register);
app.post('/auth/login', login);
app.use(globalErrorHandler);

// Mock JWT_SECRET
process.env.JWT_SECRET = 'test-secret-key';

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    const validUserData = {
      username: 'testuser123',
      email: 'test@example.com',
      password: 'TestPass123!'
    };

    it('should register a new user successfully', async () => {
      // Mock database responses
      User.findByEmail.mockResolvedValue(null);
      User.findByUsername.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 'user-uuid-123',
        username: 'testuser123',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/auth/register')
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.object).toHaveProperty('id');
      expect(response.body.object).toHaveProperty('username', 'testuser123');
      expect(response.body.object).toHaveProperty('email', 'test@example.com');
      expect(response.body.object).not.toHaveProperty('password');

      // Verify database calls
      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(User.findByUsername).toHaveBeenCalledWith('testuser123');
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser123',
        email: 'test@example.com',
        password: 'TestPass123!'
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser123'
          // Missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Username, email, and password are required');
    });

    it('should return 400 for invalid username format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          ...validUserData,
          username: 'test@user!' // Invalid characters
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('letters and numbers');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          ...validUserData,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('valid email address format');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          ...validUserData,
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('at least 8 characters');
    });

    it('should return 409 for duplicate email', async () => {
      User.findByEmail.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com'
      });
      User.findByUsername.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/register')
        .send(validUserData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('email address is already registered');
    });

    it('should return 409 for duplicate username', async () => {
      User.findByEmail.mockResolvedValue(null);
      User.findByUsername.mockResolvedValue({
        id: 'existing-user',
        username: 'testuser123'
      });

      const response = await request(app)
        .post('/auth/register')
        .send(validUserData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('username is already taken');
    });

    it('should normalize email to lowercase and trim whitespace', async () => {
      User.findByEmail.mockResolvedValue(null);
      User.findByUsername.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 'user-uuid-123',
        username: 'testuser123',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: ' testuser123 ',
          email: ' TEST@EXAMPLE.COM ',
          password: 'TestPass123!'
        });

      expect(response.status).toBe(201);
      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(User.findByUsername).toHaveBeenCalledWith('testuser123');
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser123',
        email: 'test@example.com',
        password: 'TestPass123!'
      });
    });
  });

  describe('POST /auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'TestPass123!'
    };

    const mockUser = {
      id: 'user-uuid-123',
      username: 'testuser123',
      email: 'test@example.com',
      password: 'hashed-password',
      role: 'user'
    };

    it('should login user successfully', async () => {
      User.findByEmail.mockResolvedValue(mockUser);
      User.validatePassword.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.object).toHaveProperty('token');
      expect(response.body.object).toHaveProperty('user');
      expect(response.body.object.user).toHaveProperty('id', 'user-uuid-123');
      expect(response.body.object.user).toHaveProperty('username', 'testuser123');
      expect(response.body.object.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.object.user).not.toHaveProperty('password');

      // Verify JWT token
      const decoded = jwt.verify(response.body.object.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('userId', 'user-uuid-123');
      expect(decoded).toHaveProperty('username', 'testuser123');
      expect(decoded).toHaveProperty('role', 'user');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Email and password are required');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'TestPass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('not in the correct format');
    });

    it('should return 401 for non-existent user', async () => {
      User.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      User.findByEmail.mockResolvedValue(mockUser);
      User.validatePassword.mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid credentials');
    });

    it('should handle admin user login', async () => {
      const adminUser = { ...mockUser, role: 'admin' };
      User.findByEmail.mockResolvedValue(adminUser);
      User.validatePassword.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.body.object.user.role).toBe('admin');

      const decoded = jwt.verify(response.body.object.token, process.env.JWT_SECRET);
      expect(decoded.role).toBe('admin');
    });

    it('should default to user role if role is not set', async () => {
      const userWithoutRole = { ...mockUser };
      delete userWithoutRole.role;
      
      User.findByEmail.mockResolvedValue(userWithoutRole);
      User.validatePassword.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.body.object.user.role).toBe('user');

      const decoded = jwt.verify(response.body.object.token, process.env.JWT_SECRET);
      expect(decoded.role).toBe('user');
    });
  });
});