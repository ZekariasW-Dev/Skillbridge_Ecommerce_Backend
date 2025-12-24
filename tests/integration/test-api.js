// Simple API test script
// Run this after starting the server to test basic functionality

const testAPI = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('Testing E-commerce API...\n');
  
  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData.status);
    
    // Test user registration
    console.log('\n2. Testing user registration...');
    const registerResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPass123!'
      })
    });
    const registerData = await registerResponse.json();
    console.log('Registration:', registerData.success ? 'SUCCESS' : 'FAILED');
    
    // Test user login
    console.log('\n3. Testing user login...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
    });
    const loginData = await loginResponse.json();
    console.log('Login:', loginData.success ? 'SUCCESS' : 'FAILED');
    
    // Test getting products (public)
    console.log('\n4. Testing get products...');
    const productsResponse = await fetch(`${baseURL}/products`);
    const productsData = await productsResponse.json();
    console.log('Get products:', productsData.success ? 'SUCCESS' : 'FAILED');
    console.log('Products count:', productsData.object.length);
    
    console.log('\n✅ Basic API tests completed!');
    console.log('\nTo test admin features:');
    console.log('1. Run: npm run setup-admin');
    console.log('2. Login with admin@example.com / AdminPass123!');
    console.log('3. Use the token to create/update/delete products');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the server is running: npm start');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;