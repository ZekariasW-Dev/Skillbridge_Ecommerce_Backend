const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin, isAdmin } = require('../../src/middlewares/auth');

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
      expect(() => {
        authenticateToken(req, res, next);
      }).toThrow('Authentication token is required');
      
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for malformed authorization header', () => {
      req.headers.authorization = 'InvalidFormat';

      expect(() => {
        authenticateToken(req, res, next);
      }).toThrow('Authentication token is required');
      
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      expect(() => {
        authenticateToken(req, res, next);
      }).toThrow('Invalid or expired authentication token');
      
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for expired token', () => {
      req.headers.authorization = 'Bearer expired-token';
      jwt.verify.mockImplementation((token, secret, callback) => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        callback(error, null);
      });

      expect(() => {
        authenticateToken(req, res, next);
      }).toThrow('Invalid or expired authentication token');
      
      expect(next).not.toHaveBeenCalled();
    });
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

      expect(() => {
        requireAdmin(req, res, next);
      }).toThrow('Admin role required to access this resource');
      
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for missing user (not authenticated)', () => {
      // req.user is undefined

      expect(() => {
        requireAdmin(req, res, next);
      }).toThrow('Authentication required');
      
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 for user with undefined role', () => {
      req.user = {
        userId: 'user-uuid-123',
        username: 'testuser'
        // role is undefined
      };

      expect(() => {
        requireAdmin(req, res, next);
      }).toThrow('Admin role required to access this resource');
      
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 for user with empty role', () => {
      req.user = {
        userId: 'user-uuid-123',
        username: 'testuser',
        role: ''
      };

      expect(() => {
        requireAdmin(req, res, next);
      }).toThrow('Admin role required to access this resource');
      
      expect(next).not.toHaveBeenCalled();
    });

    it('should be case sensitive for admin role', () => {
      req.user = {
        userId: 'user-uuid-123',
        username: 'testuser',
        role: 'Admin' // Wrong case
      };

      expect(() => {
        requireAdmin(req, res, next);
      }).toThrow('Admin role required to access this resource');
      
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

  describe('isAdmin', () => {
    it('should allow admin user to proceed', () => {
      req.user = {
        userId: 'admin-id',
        username: 'admin',
        role: 'admin'
      };

      isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should block non-admin user', () => {
      req.user = {
        userId: 'user-id',
        username: 'user',
        role: 'user'
      };

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Admin privileges required')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should block unauthenticated user', () => {
      // req.user is undefined

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Authentication required')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should block user with null role', () => {
      req.user = {
        userId: 'user-id',
        username: 'user',
        role: null
      };

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Admin privileges required')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should block user with undefined role', () => {
      req.user = {
        userId: 'user-id',
        username: 'user'
        // role is undefined
      };

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Admin privileges required')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});