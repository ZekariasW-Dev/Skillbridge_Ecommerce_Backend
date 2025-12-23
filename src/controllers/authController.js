const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createResponse } = require('../utils/responses');
const { validateEmail, validatePassword, validateUsername } = require('../utils/validation');

/**
 * User registration endpoint
 * POST /auth/register
 * 
 * Acceptance Criteria:
 * 1. Username: Plaintext, required, must be unique, alphanumeric only
 * 2. Email: Plaintext, required, must be unique, valid format
 * 3. Password: Plaintext during submission, stored as hashed value using bcrypt
 * 4. Returns 201 Created on success, 400 Bad Request on validation failure
 * 5. Sensitive information (password) must never be returned in response
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if all required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json(createResponse(
        false, 
        'Registration failed', 
        null, 
        ['Username, email, and password are required']
      ));
    }
    
    // Validate username
    const usernameErrors = validateUsername(username);
    if (usernameErrors.length > 0) {
      return res.status(400).json(createResponse(
        false, 
        'Registration failed', 
        null, 
        usernameErrors
      ));
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json(createResponse(
        false, 
        'Registration failed', 
        null, 
        ['Email must be a valid email address format (e.g., user@example.com)']
      ));
    }
    
    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json(createResponse(
        false, 
        'Registration failed', 
        null, 
        passwordErrors
      ));
    }
    
    // Check if email is already registered
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json(createResponse(
        false, 
        'Registration failed', 
        null, 
        ['The email is already registered']
      ));
    }
    
    // Check if username is already taken
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json(createResponse(
        false, 
        'Registration failed', 
        null, 
        ['The username is already taken']
      ));
    }
    
    // Create user (password will be hashed in the model)
    const user = await User.create({ username, email, password });
    
    // Return success response (201 Created) without sensitive information
    res.status(201).json(createResponse(
      true, 
      'User registered successfully', 
      {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    ));
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json(createResponse(
        false, 
        'Registration failed', 
        null, 
        [`The ${field} is already registered`]
      ));
    }
    
    res.status(500).json(createResponse(
      false, 
      'Internal server error', 
      null, 
      ['Registration failed due to server error']
    ));
  }
};

/**
 * User login endpoint
 * POST /auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json(createResponse(
        false, 
        'Login failed', 
        null, 
        ['Email and password are required']
      ));
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json(createResponse(
        false, 
        'Login failed', 
        null, 
        ['Email must be a valid email address format']
      ));
    }
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json(createResponse(
        false, 
        'Invalid credentials', 
        null, 
        ['Email or password is incorrect']
      ));
    }
    
    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(createResponse(
        false, 
        'Invalid credentials', 
        null, 
        ['Email or password is incorrect']
      ));
    }
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json(createResponse(
      true, 
      'Login successful', 
      {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    ));
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createResponse(
      false, 
      'Internal server error', 
      null, 
      ['Login failed due to server error']
    ));
  }
};

module.exports = {
  register,
  login
};