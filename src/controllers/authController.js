const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createResponse } = require('../utils/responses');
const { validateEmail, validatePassword, validateUsername } = require('../utils/validation');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    const errors = [];
    
    if (!username || !email || !password) {
      errors.push('Username, email, and password are required');
    }
    
    if (username) {
      errors.push(...validateUsername(username));
    }
    
    if (email && !validateEmail(email)) {
      errors.push('Invalid email format');
    }
    
    if (password) {
      errors.push(...validatePassword(password));
    }
    
    if (errors.length > 0) {
      return res.status(400).json(createResponse(false, 'Validation failed', null, errors));
    }
    
    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json(createResponse(false, 'Registration failed', null, ['Email already exists']));
    }
    
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json(createResponse(false, 'Registration failed', null, ['Username already exists']));
    }
    
    // Create user
    const user = await User.create({ username, email, password });
    
    res.status(201).json(createResponse(true, 'User registered successfully', {
      id: user.id,
      username: user.username,
      email: user.email
    }));
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(createResponse(false, 'Internal server error', null, ['Registration failed']));
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json(createResponse(false, 'Email and password are required', null, ['Missing credentials']));
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json(createResponse(false, 'Invalid email format', null, ['Invalid email']));
    }
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json(createResponse(false, 'Invalid credentials', null, ['Authentication failed']));
    }
    
    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(createResponse(false, 'Invalid credentials', null, ['Authentication failed']));
    }
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json(createResponse(true, 'Login successful', {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }));
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createResponse(false, 'Internal server error', null, ['Login failed']));
  }
};

module.exports = {
  register,
  login
};