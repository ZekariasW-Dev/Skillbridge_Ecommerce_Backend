const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testLocalBackend() {
  console.log('🧪 Testing Local Backend...\n');
  
  try {
    // Wait for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);
    
    // Test 2: Get products
    console.log('\n2️⃣ Testing products endpoint...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`);
    console.log('✅ Products endpoint working:', productsResponse.data.products?.length || 0, 'products');
    
    // Test 3: Admin login
    console.log('\n3️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@skillbridge.com',
      password: 'Admin123!'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.object.token;
      const user = loginResponse.data.object.user;
      console.log('✅ Admin login successful');
      console.log(`👤 User: ${user.username} (${user.role})`);
      
      // Test 4: Create product
      if (user.role === 'admin') {
        console.log('\n4️⃣ Testing product creation...');
        const productData = {
          name: 'Test Product Local',
          description: 'Test product for local backend verification.',
          price: 49.99,
          stock: 20,
          category: 'electronics'
        };
        
        const createResponse = await axios.post(`${API_BASE_URL}/products`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (createResponse.data.success) {
          console.log('✅ Product creation successful');
          console.log(`📦 Created: ${createResponse.data.object.name}`);
          
          // Clean up
          const productId = createResponse.data.object._id;
          await axios.delete(`${API_BASE_URL}/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('🗑️ Test product cleaned up');
        }
      }
    }
    
    console.log('\n🎉 Local backend is working correctly!');
    console.log('\n📋 Next steps:');
    console.log('1. Keep backend running: node server.js');
    console.log('2. Start frontend: cd frontend && npm run dev');
    console.log('3. Access: http://localhost:3001');
    console.log('4. Login as admin: admin@skillbridge.com / Admin123!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend not running. Start it with: node server.js');
    } else if (error.response) {
      console.error('📄 Response:', error.response.data);
    }
  }
}

testLocalBackend();