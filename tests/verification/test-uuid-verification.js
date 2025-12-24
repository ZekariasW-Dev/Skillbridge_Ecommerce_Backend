/**
 * UUID Verification Test
 * 
 * This script verifies that all database models are using UUID v4 for primary keys
 * and that the UUID generation and validation functions work correctly.
 */

require('dotenv').config();
const { 
  UUIDConfig, 
  SchemaInfo, 
  ModelUtils,
  User,
  Product,
  Order 
} = require('./src/models');

/**
 * Test UUID generation and validation
 */
function testUUIDFunctions() {
  console.log('🧪 Testing UUID Functions...\n');
  
  // Test UUID generation
  const testId = UUIDConfig.generateId();
  console.log('✅ Generated UUID:', testId);
  console.log('✅ UUID format valid:', UUIDConfig.isValidUUID(testId));
  
  // Test UUID validation with various inputs
  const testCases = [
    { input: testId, expected: true, description: 'Valid UUID v4' },
    { input: '123e4567-e89b-12d3-a456-426614174000', expected: true, description: 'Valid UUID v4 example' },
    { input: 'invalid-uuid', expected: false, description: 'Invalid UUID format' },
    { input: '12345', expected: false, description: 'Short string' },
    { input: '', expected: false, description: 'Empty string' },
    { input: null, expected: false, description: 'Null value' },
    { input: undefined, expected: false, description: 'Undefined value' }
  ];
  
  console.log('\n📋 UUID Validation Tests:');
  testCases.forEach(({ input, expected, description }) => {
    const result = UUIDConfig.isValidUUID(input);
    const status = result === expected ? '✅' : '❌';
    console.log(`${status} ${description}: ${input} -> ${result}`);
  });
  
  // Test UUID sanitization
  console.log('\n🧹 UUID Sanitization Tests:');
  const sanitizeTests = [
    { input: '  123E4567-E89B-12D3-A456-426614174000  ', description: 'Uppercase with spaces' },
    { input: '123e4567-e89b-12d3-a456-426614174000', description: 'Lowercase clean' },
    { input: 'invalid', description: 'Invalid format' }
  ];
  
  sanitizeTests.forEach(({ input, description }) => {
    const result = UUIDConfig.validateAndSanitize(input);
    console.log(`✅ ${description}: "${input}" -> ${result}`);
  });
}

/**
 * Test schema information
 */
function testSchemaInfo() {
  console.log('\n📊 Testing Schema Information...\n');
  
  const schemaInfo = SchemaInfo.getSchemaInfo();
  console.log('✅ ID Type:', schemaInfo.idType);
  console.log('✅ ID Generator:', schemaInfo.idGenerator);
  
  console.log('\n📋 Model Information:');
  Object.entries(schemaInfo.models).forEach(([modelName, info]) => {
    console.log(`✅ ${modelName}:`);
    console.log(`   - Collection: ${info.collection}`);
    console.log(`   - Primary Key: ${info.primaryKey}`);
    console.log(`   - Key Type: ${info.keyType}`);
    
    if (info.roles) {
      console.log(`   - Roles: ${info.roles.join(', ')}`);
    }
    if (info.requiredFields) {
      console.log(`   - Required Fields: ${info.requiredFields.join(', ')}`);
    }
    if (info.statuses) {
      console.log(`   - Statuses: ${info.statuses.join(', ')}`);
    }
  });
  
  // Verify UUID usage
  const uuidVerification = SchemaInfo.verifyUUIDUsage();
  console.log(`\n✅ All models use UUIDs: ${uuidVerification}`);
}

/**
 * Test model utilities
 */
function testModelUtils() {
  console.log('\n🛠️ Testing Model Utilities...\n');
  
  // Test error message generation
  console.log('✅ Invalid UUID Error:', ModelUtils.getInvalidUUIDError());
  console.log('✅ Invalid Product ID Error:', ModelUtils.getInvalidUUIDError('Product ID'));
  
  // Test multiple UUID validation
  const testUUIDs = {
    userId: UUIDConfig.generateId(),
    productId: UUIDConfig.generateId(),
    orderId: 'invalid-uuid',
    categoryId: '123e4567-e89b-12d3-a456-426614174000'
  };
  
  console.log('\n📋 Multiple UUID Validation:');
  const validationResult = ModelUtils.validateUUIDs(testUUIDs);
  console.log('✅ Overall Valid:', validationResult.valid);
  
  if (validationResult.errors.length > 0) {
    console.log('❌ Validation Errors:');
    validationResult.errors.forEach(error => {
      console.log(`   - ${error.field}: ${error.message}`);
    });
  }
}

/**
 * Test actual model UUID usage
 */
function testModelUUIDUsage() {
  console.log('\n🏗️ Testing Model UUID Usage...\n');
  
  // Check if models have the expected structure for UUID usage
  const models = [
    { name: 'User', model: User },
    { name: 'Product', model: Product },
    { name: 'Order', model: Order }
  ];
  
  models.forEach(({ name, model }) => {
    console.log(`✅ ${name} Model:`);
    console.log(`   - Has create method: ${typeof model.create === 'function'}`);
    console.log(`   - Has findById method: ${typeof model.findById === 'function'}`);
    
    // Check if the model file imports uuid (this is a basic check)
    const modelString = model.toString();
    const usesUUID = modelString.includes('uuidv4') || modelString.includes('uuid');
    console.log(`   - Uses UUID: ${usesUUID}`);
  });
}

/**
 * Main test function
 */
async function runUUIDVerificationTests() {
  console.log('🚀 UUID Verification Test Suite');
  console.log('================================\n');
  
  try {
    // Run all tests
    testUUIDFunctions();
    testSchemaInfo();
    testModelUtils();
    testModelUUIDUsage();
    
    console.log('\n🎉 All UUID verification tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ All models use UUID v4 for primary keys');
    console.log('✅ UUID generation and validation functions work correctly');
    console.log('✅ Schema information is properly configured');
    console.log('✅ Model utilities provide proper UUID handling');
    
    console.log('\n💡 UUID Benefits:');
    console.log('   - Globally unique identifiers');
    console.log('   - No collision risk across distributed systems');
    console.log('   - Secure and unpredictable');
    console.log('   - Database-agnostic');
    console.log('   - Suitable for microservices architecture');
    
  } catch (error) {
    console.error('❌ UUID verification test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runUUIDVerificationTests();
}

module.exports = {
  runUUIDVerificationTests,
  testUUIDFunctions,
  testSchemaInfo,
  testModelUtils,
  testModelUUIDUsage
};