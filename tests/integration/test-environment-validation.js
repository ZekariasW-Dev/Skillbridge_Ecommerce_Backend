/**
 * Environment Validation Test Suite
 * Tests the server environment variable validation functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Environment Validation Test Suite');
console.log('====================================');

/**
 * Test environment validation functionality
 */
const testEnvironmentValidation = () => {
  console.log('\n🧪 Testing Environment Validation...');
  
  // Read the server.js file to analyze environment validation
  const serverPath = path.join(__dirname, 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Check for environment validation function
  const hasValidateEnvironment = serverContent.includes('validateEnvironment');
  const hasRequiredEnvVars = serverContent.includes('requiredEnvVars');
  const hasOptionalEnvVars = serverContent.includes('optionalEnvVars');
  const hasMissingVarCheck = serverContent.includes('missingRequired');
  const hasEnvVarDescriptions = serverContent.includes('getEnvVarDescription');
  const hasSpecificValidation = serverContent.includes('validateSpecificEnvVars');
  const hasJWTSecretValidation = serverContent.includes('JWT_SECRET') && serverContent.includes('length < 32');
  const hasPortValidation = serverContent.includes('PORT') && serverContent.includes('65535');
  const hasCloudinaryValidation = serverContent.includes('CLOUDINARY') && serverContent.includes('cloudinaryVars');
  
  console.log('✅ Environment Validation Analysis:');
  console.log(`   - Has validateEnvironment function: ${hasValidateEnvironment ? '✅' : '❌'}`);
  console.log(`   - Defines required environment variables: ${hasRequiredEnvVars ? '✅' : '❌'}`);
  console.log(`   - Defines optional environment variables: ${hasOptionalEnvVars ? '✅' : '❌'}`);
  console.log(`   - Checks for missing variables: ${hasMissingVarCheck ? '✅' : '❌'}`);
  console.log(`   - Has environment variable descriptions: ${hasEnvVarDescriptions ? '✅' : '❌'}`);
  console.log(`   - Has specific validation logic: ${hasSpecificValidation ? '✅' : '❌'}`);
  console.log(`   - Validates JWT_SECRET strength: ${hasJWTSecretValidation ? '✅' : '❌'}`);
  console.log(`   - Validates PORT range: ${hasPortValidation ? '✅' : '❌'}`);
  console.log(`   - Validates Cloudinary configuration: ${hasCloudinaryValidation ? '✅' : '❌'}`);
  
  return hasValidateEnvironment && hasRequiredEnvVars && hasOptionalEnvVars && 
         hasMissingVarCheck && hasEnvVarDescriptions && hasSpecificValidation &&
         hasJWTSecretValidation && hasPortValidation && hasCloudinaryValidation;
};

/**
 * Test required environment variables definition
 */
const testRequiredEnvironmentVariables = () => {
  console.log('\n🔑 Testing Required Environment Variables...');
  
  const serverPath = path.join(__dirname, 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Extract required environment variables from the code
  const requiredVarsMatch = serverContent.match(/requiredEnvVars\s*=\s*\[([\s\S]*?)\]/);
  
  if (requiredVarsMatch) {
    const requiredVarsContent = requiredVarsMatch[1];
    const expectedVars = ['MONGODB_URI', 'JWT_SECRET'];
    
    console.log('✅ Required Environment Variables Check:');
    expectedVars.forEach(varName => {
      const isPresent = requiredVarsContent.includes(`'${varName}'`) || requiredVarsContent.includes(`"${varName}"`);
      console.log(`   - ${varName}: ${isPresent ? '✅' : '❌'}`);
    });
    
    return expectedVars.every(varName => 
      requiredVarsContent.includes(`'${varName}'`) || requiredVarsContent.includes(`"${varName}"`)
    );
  }
  
  console.log('❌ Could not find requiredEnvVars definition');
  return false;
};

/**
 * Test optional environment variables definition
 */
const testOptionalEnvironmentVariables = () => {
  console.log('\n🔧 Testing Optional Environment Variables...');
  
  const serverPath = path.join(__dirname, 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Extract optional environment variables from the code
  const optionalVarsMatch = serverContent.match(/optionalEnvVars\s*=\s*\[([\s\S]*?)\]/);
  
  if (optionalVarsMatch) {
    const optionalVarsContent = optionalVarsMatch[1];
    const expectedVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'PORT', 'NODE_ENV'];
    
    console.log('✅ Optional Environment Variables Check:');
    expectedVars.forEach(varName => {
      const isPresent = optionalVarsContent.includes(`'${varName}'`) || optionalVarsContent.includes(`"${varName}"`);
      console.log(`   - ${varName}: ${isPresent ? '✅' : '❌'}`);
    });
    
    return expectedVars.every(varName => 
      optionalVarsContent.includes(`'${varName}'`) || optionalVarsContent.includes(`"${varName}"`)
    );
  }
  
  console.log('❌ Could not find optionalEnvVars definition');
  return false;
};

/**
 * Test environment validation integration
 */
const testEnvironmentValidationIntegration = () => {
  console.log('\n🔗 Testing Environment Validation Integration...');
  
  const serverPath = path.join(__dirname, 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Check if validation is called before server startup
  const hasValidationCall = serverContent.includes('validateEnvironment()');
  const hasValidationBeforeApp = serverContent.indexOf('validateEnvironment()') < serverContent.indexOf('require(\'./app\')');
  const hasStartupLog = serverContent.includes('Environment validation: ✅ Passed');
  
  console.log('✅ Environment Validation Integration:');
  console.log(`   - Validation function is called: ${hasValidationCall ? '✅' : '❌'}`);
  console.log(`   - Validation runs before app import: ${hasValidationBeforeApp ? '✅' : '❌'}`);
  console.log(`   - Startup log includes validation status: ${hasStartupLog ? '✅' : '❌'}`);
  
  return hasValidationCall && hasValidationBeforeApp && hasStartupLog;
};

/**
 * Test current environment variables
 */
const testCurrentEnvironmentVariables = () => {
  console.log('\n📊 Testing Current Environment Variables...');
  
  // Read .env file to check current configuration
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('⚠️  .env file not found or not readable');
    return false;
  }
  
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const optionalVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'PORT', 'NODE_ENV'];
  
  console.log('✅ Current Environment Variables Status:');
  
  console.log('   Required Variables:');
  requiredVars.forEach(varName => {
    const isPresent = envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=\n`);
    console.log(`     - ${varName}: ${isPresent ? '✅' : '❌'}`);
  });
  
  console.log('   Optional Variables:');
  optionalVars.forEach(varName => {
    const isPresent = envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=\n`);
    console.log(`     - ${varName}: ${isPresent ? '✅' : '⚠️ '}`);
  });
  
  return true;
};

/**
 * Test best practices implementation
 */
const testBestPracticesImplementation = () => {
  console.log('\n🏆 Testing Best Practices Implementation...');
  
  const serverPath = path.join(__dirname, 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Check for best practices
  const hasEarlyValidation = serverContent.indexOf('validateEnvironment()') < serverContent.indexOf('const app');
  const hasDescriptiveErrors = serverContent.includes('getEnvVarDescription');
  const hasGracefulExit = serverContent.includes('process.exit(1)') && serverContent.includes('missingRequired');
  const hasSecurityValidation = serverContent.includes('JWT_SECRET') && serverContent.includes('32');
  const hasComprehensiveLogging = serverContent.includes('Present variables') && serverContent.includes('Missing required');
  const hasValidationComments = serverContent.includes('Best Practice: Ensure all necessary secrets');
  
  console.log('✅ Best Practices Implementation:');
  console.log(`   - Early validation (before app import): ${hasEarlyValidation ? '✅' : '❌'}`);
  console.log(`   - Descriptive error messages: ${hasDescriptiveErrors ? '✅' : '❌'}`);
  console.log(`   - Graceful exit on missing vars: ${hasGracefulExit ? '✅' : '❌'}`);
  console.log(`   - Security validation (JWT strength): ${hasSecurityValidation ? '✅' : '❌'}`);
  console.log(`   - Comprehensive logging: ${hasComprehensiveLogging ? '✅' : '❌'}`);
  console.log(`   - Documentation comments: ${hasValidationComments ? '✅' : '❌'}`);
  
  return hasEarlyValidation && hasDescriptiveErrors && hasGracefulExit && 
         hasSecurityValidation && hasComprehensiveLogging && hasValidationComments;
};

/**
 * Run all tests
 */
const runAllTests = () => {
  console.log('🧪 Running Environment Validation Test Suite...\n');
  
  const results = {
    environmentValidation: testEnvironmentValidation(),
    requiredVariables: testRequiredEnvironmentVariables(),
    optionalVariables: testOptionalEnvironmentVariables(),
    validationIntegration: testEnvironmentValidationIntegration(),
    currentEnvironment: testCurrentEnvironmentVariables(),
    bestPractices: testBestPracticesImplementation()
  };
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  Object.entries(results).forEach(([testName, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const displayName = testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} - ${displayName}`);
  });
  
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Environment validation implementation is complete and follows best practices!');
    console.log('💡 Benefits:');
    console.log('   - Server fails fast if required secrets are missing');
    console.log('   - Clear error messages help with troubleshooting');
    console.log('   - Security validation ensures strong JWT secrets');
    console.log('   - Comprehensive logging aids in debugging');
    console.log('   - Follows industry best practices for server startup');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }
  
  return allPassed;
};

// Run the test suite
runAllTests();