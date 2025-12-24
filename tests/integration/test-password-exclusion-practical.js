/**
 * Practical Password Exclusion Test
 * Tests actual API responses to ensure passwords are never returned
 * Page 4 PDF Requirement: "Sensitive information, like the password, must never be returned in the API response"
 */

const request = require('supertest');
const app = require('./app');

console.log('🔒 Practical Password Exclusion Test');
console.log('===================================');

/**
 * Test registration response for password exclusion
 */
const testRegistrationPasswordExclusion = async () => {
  console.log('\n📝 Testing Registration Password Exclusion...');
  
  try {
    const testUser = {
      username: `testuser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };
    
    const response = await request(app)
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    
    const responseBody = JSON.stringify(response.body);
    const hasPassword = responseBody.includes('password') || 
                       responseBody.includes('TestPassword123!');
    
    console.log('✅ Registration Response Analysis:');
    console.log(`   - Response status: ${response.status === 201 ? '✅ 201 Created' : '❌ ' + response.status}`);
    console.log(`   - Password excluded from response: ${!hasPassword ? '✅' : '❌'}`);
    console.log(`   - Response contains user data: ${response.body.data && response.body.data.id ? '✅' : '❌'}`);
    console.log(`   - Response contains safe fields only: ${response.body.data && response.body.data.username && response.body.data.email ? '✅' : '❌'}`);
    
    if (hasPassword) {
      console.log('   ⚠️  WARNING: Password found in response!');
      console.log('   Response body:', JSON.stringify(response.body, null, 2));
    }
    
    return !hasPassword && response.status === 201;
    
  } catch (error) {
    console.log('   ❌ Registration test failed:', error.message);
    return false;
  }
};

/**
 * Test login response for password exclusion
 */
const testLoginPasswordExclusion = async () => {
  console.log('\n🔐 Testing Login Password Exclusion...');
  
  try {
    // First register a user
    const testUser = {
      username: `logintest${Date.now()}`,
      email: `logintest${Date.now()}@example.com`,
      password: 'LoginTestPassword123!'
    };
    
    await request(app)
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    
    // Then login with the user
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);
    
    const responseBody = JSON.stringify(loginResponse.body);
    const hasPassword = responseBody.includes('password') || 
                       responseBody.includes('LoginTestPassword123!');
    
    console.log('✅ Login Response Analysis:');
    console.log(`   - Response status: ${loginResponse.status === 200 ? '✅ 200 OK' : '❌ ' + loginResponse.status}`);
    console.log(`   - Password excluded from response: ${!hasPassword ? '✅' : '❌'}`);
    console.log(`   - Response contains JWT token: ${loginResponse.body.data && loginResponse.body.data.token ? '✅' : '❌'}`);
    console.log(`   - Response contains user data: ${loginResponse.body.data && loginResponse.body.data.user ? '✅' : '❌'}`);
    console.log(`   - User data contains safe fields only: ${loginResponse.body.data && loginResponse.body.data.user && loginResponse.body.data.user.username ? '✅' : '❌'}`);
    
    if (hasPassword) {
      console.log('   ⚠️  WARNING: Password found in response!');
      console.log('   Response body:', JSON.stringify(loginResponse.body, null, 2));
    }
    
    return !hasPassword && loginResponse.status === 200;
    
  } catch (error) {
    console.log('   ❌ Login test failed:', error.message);
    return false;
  }
};

/**
 * Test JWT token payload for password exclusion
 */
const testJWTPayloadSecurity = async () => {
  console.log('\n🎫 Testing JWT Payload Security...');
  
  try {
    // Register and login to get a JWT
    const testUser = {
      username: `jwttest${Date.now()}`,
      email: `jwttest${Date.now()}@example.com`,
      password: 'JWTTestPassword123!'
    };
    
    await request(app)
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);
    
    const token = loginResponse.body.data.token;
    
    if (token) {
      // Decode JWT payload (without verification for testing)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const payloadString = JSON.stringify(payload);
      
      const hasPassword = payloadString.includes('password') || 
                         payloadString.includes('JWTTestPassword123!');
      
      console.log('✅ JWT Payload Analysis:');
      console.log(`   - JWT token generated: ✅`);
      console.log(`   - Password excluded from JWT payload: ${!hasPassword ? '✅' : '❌'}`);
      console.log(`   - JWT contains userId: ${payload.userId ? '✅' : '❌'}`);
      console.log(`   - JWT contains username: ${payload.username ? '✅' : '❌'}`);
      console.log(`   - JWT contains role: ${payload.role ? '✅' : '❌'}`);
      
      if (hasPassword) {
        console.log('   ⚠️  WARNING: Password found in JWT payload!');
        console.log('   JWT payload:', JSON.stringify(payload, null, 2));
      }
      
      return !hasPassword;
    } else {
      console.log('   ❌ No JWT token in response');
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ JWT test failed:', error.message);
    return false;
  }
};

/**
 * Test error responses for password exclusion
 */
const testErrorResponseSecurity = async () => {
  console.log('\n⚠️  Testing Error Response Security...');
  
  try {
    // Test registration with existing email
    const testUser = {
      username: `errortest${Date.now()}`,
      email: `errortest${Date.now()}@example.com`,
      password: 'ErrorTestPassword123!'
    };
    
    // Register user first
    await request(app)
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    
    // Try to register again with same email (should fail)
    const errorResponse = await request(app)
      .post('/auth/register')
      .send(testUser)
      .expect(409);
    
    const errorResponseBody = JSON.stringify(errorResponse.body);
    const hasPassword = errorResponseBody.includes('password') || 
                       errorResponseBody.includes('ErrorTestPassword123!');
    
    console.log('✅ Error Response Analysis:');
    console.log(`   - Error response status: ${errorResponse.status === 409 ? '✅ 409 Conflict' : '❌ ' + errorResponse.status}`);
    console.log(`   - Password excluded from error response: ${!hasPassword ? '✅' : '❌'}`);
    console.log(`   - Error message is appropriate: ${errorResponse.body.message ? '✅' : '❌'}`);
    
    if (hasPassword) {
      console.log('   ⚠️  WARNING: Password found in error response!');
      console.log('   Error response body:', JSON.stringify(errorResponse.body, null, 2));
    }
    
    return !hasPassword;
    
  } catch (error) {
    console.log('   ❌ Error response test failed:', error.message);
    return false;
  }
};

/**
 * Run all practical tests
 */
const runPracticalTests = async () => {
  console.log('🧪 Running Practical Password Exclusion Tests...\n');
  
  const results = {
    registrationPasswordExclusion: await testRegistrationPasswordExclusion(),
    loginPasswordExclusion: await testLoginPasswordExclusion(),
    jwtPayloadSecurity: await testJWTPayloadSecurity(),
    errorResponseSecurity: await testErrorResponseSecurity()
  };
  
  console.log('\n📋 Practical Test Results Summary:');
  console.log('==================================');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  Object.entries(results).forEach(([testName, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const displayName = testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} - ${displayName}`);
  });
  
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Password exclusion is working correctly in practice!');
    console.log('💡 Security Verification:');
    console.log('   - Registration responses never contain passwords');
    console.log('   - Login responses never contain passwords');
    console.log('   - JWT tokens never contain passwords');
    console.log('   - Error responses never leak passwords');
    console.log('   - Complete compliance with Page 4 PDF security requirement');
  } else {
    console.log('\n⚠️  Some practical tests failed. Passwords may be leaking in responses!');
  }
  
  console.log('\n🔒 Page 4 PDF Requirement Verification:');
  console.log('   "Sensitive information, like the password, must never be returned in the API response"');
  console.log(`   Practical Status: ${allPassed ? '✅ FULLY COMPLIANT' : '❌ SECURITY ISSUE DETECTED'}`);
  
  return allPassed;
};

// Run the practical tests
if (require.main === module) {
  runPracticalTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runPracticalTests };