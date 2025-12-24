// Jest setup file for global test configuration

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests';

// Mock console methods to reduce noise in test output
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Suppress console.error and console.log during tests unless explicitly needed
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// Global test utilities
global.createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ...overrides
});

global.createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  };
  return res;
};

global.createMockNext = () => jest.fn();

// Mock database connection for all tests
jest.mock('../src/config/db', () => ({
  connect: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true),
  getCollection: jest.fn().mockReturnValue({
    findOne: jest.fn(),
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis()
    }),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn().mockResolvedValue(0)
  }),
  withTransaction: jest.fn()
}));

// Suppress specific warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('deprecated')) {
    return;
  }
  originalWarn.apply(console, args);
};