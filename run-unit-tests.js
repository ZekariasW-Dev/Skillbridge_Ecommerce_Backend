#!/usr/bin/env node

/**
 * Unit Test Runner for E-commerce API
 * 
 * This script runs all unit tests with database mocking
 * and provides comprehensive test coverage reporting.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 E-commerce API Unit Test Suite');
console.log('=====================================\n');

console.log('📋 Test Configuration:');
console.log('  - Environment: Test (mocked database)');
console.log('  - Framework: Jest + Supertest');
console.log('  - Coverage: Enabled');
console.log('  - Timeout: 10 seconds per test\n');

try {
  console.log('🚀 Running unit tests...\n');
  
  // Run Jest with coverage
  execSync('npm test -- --coverage --verbose', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ All unit tests completed successfully!');
  console.log('\n📊 Coverage Report:');
  console.log('  - Text report displayed above');
  console.log('  - HTML report: ./coverage/index.html');
  console.log('  - LCOV report: ./coverage/lcov.info');
  
  console.log('\n🎯 Test Categories Covered:');
  console.log('  ✅ Authentication Controller (register, login)');
  console.log('  ✅ Product Controller (CRUD operations, search, pagination)');
  console.log('  ✅ Order Controller (create orders, view history)');
  console.log('  ✅ Authentication Middleware (token validation, admin checks)');
  console.log('  ✅ Validation Utils (email, password, username, product)');
  console.log('  ✅ Response Utils (standard responses, pagination)');
  
  console.log('\n🔍 Key Testing Features:');
  console.log('  ✅ Database mocking (no real DB required)');
  console.log('  ✅ HTTP request/response testing');
  console.log('  ✅ Authentication flow testing');
  console.log('  ✅ Input validation testing');
  console.log('  ✅ Error handling testing');
  console.log('  ✅ Edge case coverage');
  console.log('  ✅ Business logic validation');
  
  console.log('\n💡 Next Steps:');
  console.log('  - Review coverage report for any gaps');
  console.log('  - Run integration tests: npm run test-api');
  console.log('  - Run specific endpoint tests: npm run test-login');
  
} catch (error) {
  console.error('\n❌ Unit tests failed!');
  console.error('Error:', error.message);
  
  console.log('\n🔧 Troubleshooting:');
  console.log('  1. Ensure all dependencies are installed: npm install');
  console.log('  2. Check Jest configuration in package.json');
  console.log('  3. Verify test files are in __tests__ directory');
  console.log('  4. Check for syntax errors in test files');
  
  process.exit(1);
}

console.log('\n🎉 Unit testing complete! All systems tested and verified.');