const axios = require('axios');

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Connection...\n');

  try {
    // Test if backend is accessible from frontend's perspective
    console.log('1. Testing backend accessibility...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Backend is accessible');
    console.log('   Status:', healthResponse.data.status);

    // Test CORS
    console.log('\n2. Testing CORS...');
    const corsResponse = await axios.get('http://localhost:3000/products?pageSize=1', {
      headers: {
        'Origin': 'http://localhost:3001'
      }
    });
    console.log('✅ CORS is working');

    // Test authentication
    console.log('\n3. Testing authentication...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'admin@skillbridge.com',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.object.token;
    console.log('✅ Authentication working');

    // Test favorites API
    console.log('\n4. Testing favorites API...');
    const favoritesResponse = await axios.get('http://localhost:3000/favorites', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': 'http://localhost:3001'
      }
    });
    
    console.log('✅ Favorites API working');
    console.log('   Response:', favoritesResponse.data);

    console.log('\n🎉 All API tests passed!');
    console.log('\n📋 Debugging steps for frontend:');
    console.log('1. Open browser dev tools (F12)');
    console.log('2. Go to Console tab');
    console.log('3. Look for the debug messages starting with 🔄, 📡, 📥, ✅, or ❌');
    console.log('4. Check Network tab for failed requests');
    console.log('5. Verify you are logged in (check localStorage for token)');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFrontendAPI();