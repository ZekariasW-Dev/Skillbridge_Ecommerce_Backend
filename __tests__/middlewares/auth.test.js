const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin } = require('../../src/middlewares/auth');

// Mock JWT
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token successfully', () => {
      const mockUser = {
        userId: 'user-uuid-123',
        username: 'testuser',
        role: 'user'
      };

      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      authenticateToken(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 for missing token', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication token is required',
        object: null,
        errors: ['Authentication token is required']
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for malformed authorization header', () => {
      req.headers.authorization = 'InvalidFormat';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication token is required',
        object: null,
        errors: ['Authentication token is required']
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired authentication token',
        object: null,
        errors: ['Invalid or expired authentication token']
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for expired token', () => {
      req.headers.authorization = 'Bearer expired-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        callback(error, null);
      });

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired authentication token',
        object: null,
        errors: ['Invalid or expired authentication token']
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle different token formats', () => {
      const mockUser = {
        userId: 'user-uuid-123',
        username: 'testuser',
        role: 'admin'
      };

      // Test with extra spaces
      req.headers.authorization = '  Bearer   valid-token  ';
      jwt.verify.mockImplementation((token, secret, callback) => {
        expect(token).toBe('valid-token');
        callback(null, mockUser);
      });

      authenticateToken(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin user to proceed', () => {
      req.user = {
        userId: 'admin-uuid-123',
        username: 'admin',
        role: 'admin'
      };

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 for non-admin user', () => {
      req.user = {
        userId: 'user-uuid-123',
        username: 'testuser',
        role: 'user'
      };

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Admin role required to access this resource',
        object: null,
        errors: ['Admin role required to access this resource']
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for missing user (not authenticated)', () => {
      // req.user is undefined

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        object: null,
        errors: ['Authentication required']
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 for user with undefined role', () => {
      req.user = {
        userId: 'user-uuid-123',
        username: 'testuser'
        // role is undefined
      };

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Admin role required to access this resource',
        object: null,
        errors: ['Admin role required to access this resource']
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 for user with empty role', () => {
      req.user = {
        userId: 'user-uuid-123',
        username: 'testuser',
        role: ''
      };

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should be case sensitive for admin role', () => {
      req.user = {
        userId: 'user-uuid-123',
        username: 'testuser',
        role: 'Admin' // Wrong case
      };

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Middleware Chain', () => {
    it('should work together for admin-protected routes', () => {
      const mockUser = {
        userId: 'admin-uuid-123',
        username: 'admin',
        role: 'admin'
      };

      // First middleware: authenticateToken
      req.headers.authorization = 'Bearer valid-admin-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      authenticateToken(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledTimes(1);

      // Reset next mock for second middleware
      next.mockClear();

      // Second middleware: requireAdmin
      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should block non-admin users in middleware chain', () => {
      const mockUser = {
        userId: 'user-uuid-123',
        username: 'testuser',
        role: 'user'
      };

      // First middleware: authenticateToken
      req.headers.authorization = 'Bearer valid-user-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      authenticateToken(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledTimes(1);

      // Reset mocks for second middleware
      next.mockClear();
      res.status.mockClear();
      res.json.mockClear();

      // Second middleware: requireAdmin (should block)
      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});