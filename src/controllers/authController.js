const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createResponse } = require('../utils/responses');
const { validateEmail, validatePassword, validateUsername } = require('../utils/validation');
const { 
  ValidationError, 
  AuthenticationError, 
  ConflictError,
  asyncErrorHandler 
} = require('../middlewares/errorHandler');

/**
 * User registration endpoint
 * POST /auth/register
 * 
 * Page 4 PDF Requirement: "The system must check that the email/username is not already registered"
 * 
 * Acceptance Criteria:
 * 1. Username: Plaintext, required, must be unique, alphanumeric only
 * 2. Email: Plaintext, required, must be unique, valid format
 * 3. Password: Plaintext during submission, stored as hashed value using bcrypt
 * 4. Returns 201 Created on success, 400 Bad Request on validation failure
 * 5. Sensitive information (password) must never be returned in response
 * 6. Professional approach: Check database for duplicates BEFORE attempting creation
 */
const register = asyncErrorHandler(async (req, res) => {
  const { username, email, password } = req.body;
  
  // Step 1: Input validation - Check if all required fields are provided
  if (!username || !email || !password) {
    throw new ValidationError('Registration failed', ['Username, email, and password are required']);
  }
  
  // Step 2: Format validation - Validate username format (Page 4 PDF requirement)
  const usernameErrors = validateUsername(username);
  if (usernameErrors && usernameErrors.length > 0) {
    throw new ValidationError('Registration failed', usernameErrors);
  }
  
  // Step 3: Format validation - Validate email format
  if (!validateEmail(email)) {
    throw new ValidationError('Registration failed', ['Email must be a valid email address format (e.g., user@example.com)']);
  }
  
  // Step 4: Format validation - Validate password strength (Page 4 PDF requirement)
  const passwordErrors = validatePassword(password);
  if (passwordErrors && passwordErrors.length > 0) {
    throw new ValidationError('Registration failed', passwordErrors);
  }
  
  // Step 5: Database uniqueness check - Professional approach (Page 4 PDF requirement)
  // Check email uniqueness BEFORE attempting to create user
  const existingUserByEmail = await User.findByEmail(email.toLowerCase().trim());
  if (existingUserByEmail) {
    throw new ConflictError('Registration failed', ['The email address is already registered']);
  }
  
  // Step 6: Database uniqueness check - Check username uniqueness BEFORE attempting to create user
  const existingUserByUsername = await User.findByUsername(username.trim());
  if (existingUserByUsername) {
    throw new ConflictError('Registration failed', ['The username is already taken']);
  }
  
  // Step 7: Create user - Safe to create since we've verified uniqueness
  const user = await User.create({ 
    username: username.trim(), 
    email: email.toLowerCase().trim(), 
    password,
    firstName: req.body.firstName || '',
    lastName: req.body.lastName || ''
  });
  
  // Step 8: Return success response (201 Created) without sensitive information
  res.status(201).json(createResponse(
    true, 
    'User registered successfully',
    {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  ));
});

/**
 * User login endpoint
 * POST /auth/login
 * 
 * User Story 2 - Login
 * Acceptance Criteria:
 * 1. User provides email and password credentials
 * 2. System finds user by email and validates password against stored hash
 * 3. Returns 401 Unauthorized for invalid credentials with "Invalid credentials" message
 * 4. Returns 400 Bad Request for invalid input (e.g., incorrect email format)
 * 5. Returns 200 OK with JWT containing userId, username, and role on success
 */
const login = asyncErrorHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Input validation - check if credentials are provided
  if (!email || !password) {
    throw new ValidationError('Login failed', ['Email and password are required']);
  }
  
  // Input validation - check email format
  if (!validateEmail(email)) {
    throw new ValidationError('Login failed', ['Email is not in the correct format']);
  }
  
  // Authentication Process: Find user in database by email address
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  // Authentication Process: Compare submitted password against stored hashed password
  const isValidPassword = await User.verifyPassword(password, user.password);
  if (!isValidPassword) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  // Successful Login: Generate JWT with essential, non-sensitive user information
  const jwtPayload = {
    userId: user._id.toString(),
    username: user.username,
    role: user.role || 'user'
  };
  
  const token = jwt.sign(
    jwtPayload,
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  // Return 200 OK with JWT for client to use in subsequent requests
  res.status(200).json(createResponse(
    true, 
    'Login successful', 
    {
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
      }
    }
  ));
});

module.exports = {
  register,
  login
};