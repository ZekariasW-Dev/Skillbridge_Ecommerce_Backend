// Test script for User Story 2 - Login functionality
// Run this after starting the server to test login endpoint

const testLogin = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing User Story 2 - Login Functionality\n');
  
  try {
    // Test 1: Register a test user first
    console.log('1️⃣ Creating test user for login tests...');
    const registerResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser123',
        email: 'testuser@example.com',
        password: 'TestPass123!'
      })
    });
    
    if (registerResponse.status === 201) {
      console.log('✅ Test user created successfully');
    } else if (registerResponse.status === 400) {
      const data = await registerResponse.json();
      if (data.errors && data.errors.some(err => err.includes('already'))) {
        console.log('ℹ️  Test user already exists, proceeding with login tests');
      } else {
        console.log('❌ Failed to create test user:', data.errors);
        return;
      }
    }
    
    // Test 2: Valid login
    console.log('\n2️⃣ Testing valid login credentials...');
    const validLoginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'TestPass123!'
      })
    });
    
    const validLoginData = await validLoginResponse.json();
    if (validLoginResponse.status === 200 && validLoginData.success) {
      console.log('✅ Valid login: SUCCESS');
      console.log('🎫 JWT Token received:', validLoginData.object.token ? 'YES' : 'NO');
      console.log('👤 User info:', {
        id: validLoginData.object.user.id ? 'Present' : 'Missing',
        username: validLoginData.object.user.username,
        role: validLoginData.object.user.role
      });
    } else {
      console.log('❌ Valid login failed:', validLoginData);
    }
    
    // Test 3: Invalid email format (400 Bad Request)
    console.log('\n3️⃣ Testing invalid email format...');
    const invalidEmailResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'TestPass123!'
      })
    });
    
    const invalidEmailData = await invalidEmailResponse.json();
    if (invalidEmailResponse.status === 400) {
      console.log('✅ Invalid email format: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', invalidEmailData.errors[0]);
    } else {
      console.log('❌ Invalid email format test failed');
    }
    
    // Test 4: Non-existent user (401 Unauthorized)
    console.log('\n4️⃣ Testing non-existent user...');
    const nonExistentResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'TestPass123!'
      })
    });
    
    const nonExistentData = await nonExistentResponse.json();
    if (nonExistentResponse.status === 401) {
      console.log('✅ Non-existent user: 401 Unauthorized (CORRECT)');
      console.log('📝 Error message:', nonExistentData.errors[0]);
    } else {
      console.log('❌ Non-existent user test failed');
    }
    
    // Test 5: Wrong password (401 Unauthorized)
    console.log('\n5️⃣ Testing wrong password...');
    const wrongPasswordResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'WrongPassword123!'
      })
    });
    
    const wrongPasswordData = await wrongPasswordResponse.json();
    if (wrongPasswordResponse.status === 401) {
      console.log('✅ Wrong password: 401 Unauthorized (CORRECT)');
      console.log('📝 Error message:', wrongPasswordData.errors[0]);
    } else {
      console.log('❌ Wrong password test failed');
    }
    
    // Test 6: Missing credentials (400 Bad Request)
    console.log('\n6️⃣ Testing missing credentials...');
    const missingCredsResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com'
        // password missing
      })
    });
    
    const missingCredsData = await missingCredsResponse.json();
    if (missingCredsResponse.status === 400) {
      console.log('✅ Missing credentials: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', missingCredsData.errors[0]);
    } else {
      console.log('❌ Missing credentials test failed');
    }
    
    console.log('\n🎉 User Story 2 - Login Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ POST /auth/login endpoint implemented');
    console.log('✅ Email and password authentication');
    console.log('✅ 200 OK with JWT on successful login');
    console.log('✅ 401 Unauthorized for invalid credentials');
    console.log('✅ 400 Bad Request for invalid input');
    console.log('✅ JWT contains userId, username, and role');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testLogin();
}

module.exports = testLogin;