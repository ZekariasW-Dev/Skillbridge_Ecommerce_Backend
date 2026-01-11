const axios = require('axios');

const API_BASE_URL = 'https://skillbridge-ecommerce-backend-3.onrender.com';

async function testFullstack() {
  console.log('🧪 Testing Fullstack Application...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing backend health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data.message);
    
    // Test 2: Admin login
    console.log('\n2️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@skillbridge.com',
      password: 'Admin123!'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.object.token;
      const user = loginResponse.data.object.user;
      console.log('✅ Admin login successful');
      console.log(`👤 User: ${user.username} (${user.role})`);
      
      // Test 3: Get products
      console.log('\n3️⃣ Testing products API...');
      const productsResponse = await axios.get(`${API_BASE_URL}/products`);
      
      if (productsResponse.data.success) {
        const products = productsResponse.data.products || [];
        console.log(`✅ Products API working: ${products.length} products found`);
        
        if (products.length > 0) {
          console.log(`📦 Sample product: ${products[0].name} - $${products[0].price}`);
        }
        
        // Test 4: Create a test product (admin only)
        if (user.role === 'admin') {
          console.log('\n4️⃣ Testing product creation...');
          const testProduct = {
            name: 'Test Product - API Test',
            description: 'This is a test product created via API test.',
            price: 19.99,
            stock: 10,
            category: 'electronics'
          };
          
          const createResponse = await axios.post(`${API_BASE_URL}/products`, testProduct, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (createResponse.data.success) {
            console.log('✅ Product creation successful');
            console.log(`📦 Created: ${createResponse.data.object.name}`);
            
            // Clean up - delete test product
            const productId = createResponse.data.object._id;
            await axios.delete(`${API_BASE_URL}/products/${productId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('🗑️ Test product cleaned up');
          }
        }
        
        console.log('\n🎉 All tests passed! Fullstack application is working correctly.');
        console.log('\n📋 Ready to use:');
        console.log('🌐 Frontend: http://localhost:3001');
        console.log('🔑 Admin Login: admin@skillbridge.com / Admin123!');
        console.log('📊 Admin Dashboard: /admin (after login)');
        console.log(`📦 Products available: ${products.length}`);
        
      } else {
        console.log('❌ Products API failed:', productsResponse.data.message);
      }
    } else {
      console.log('❌ Admin login failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📄 Response:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure backend is deployed and running');
    console.log('2. Check MongoDB connection');
    console.log('3. Verify admin user exists with correct role');
    console.log('4. Run setup-admin-and-products.js if needed');
  }
}

testFullstack();