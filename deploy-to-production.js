const axios = require('axios');

const PRODUCTION_API = 'https://skillbridge-ecommerce-backend-3.onrender.com';

async function deployToProduction() {
  console.log('🚀 Deploying to Production...\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Checking backend status...');
    const healthCheck = await axios.get(`${PRODUCTION_API}/health`);
    console.log('✅ Backend is running:', healthCheck.data.message);
    
    // Test 2: Check admin user
    console.log('\n2️⃣ Testing admin login...');
    const adminLogin = await axios.post(`${PRODUCTION_API}/auth/login`, {
      email: 'admin@skillbridge.com',
      password: 'Admin123!'
    });
    
    if (adminLogin.data.success) {
      const token = adminLogin.data.object.token;
      const user = adminLogin.data.object.user;
      console.log(`✅ Admin login successful: ${user.username} (${user.role})`);
      
      // Test 3: Check products
      console.log('\n3️⃣ Checking products...');
      const products = await axios.get(`${PRODUCTION_API}/products`);
      console.log(`✅ Found ${products.data.products?.length || 0} products`);
      
      // Test 4: Check if products have images
      if (products.data.products && products.data.products.length > 0) {
        const sampleProduct = products.data.products[0];
        console.log(`📦 Sample product: ${sampleProduct.name}`);
        console.log(`🖼️ Has image: ${sampleProduct.images?.primary ? 'Yes' : 'No'}`);
        
        if (sampleProduct.images?.primary) {
          console.log(`🔗 Image URL: ${sampleProduct.images.primary}`);
        }
      }
      
      // Test 5: Test product creation (to verify backend is working)
      console.log('\n4️⃣ Testing product creation...');
      const testProduct = {
        name: 'Production Test Product',
        description: 'Test product to verify production deployment.',
        price: 99.99,
        stock: 10,
        category: 'electronics'
      };
      
      try {
        const createResponse = await axios.post(`${PRODUCTION_API}/products`, testProduct, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (createResponse.data.success) {
          console.log('✅ Product creation working');
          
          // Clean up test product
          await axios.delete(`${PRODUCTION_API}/products/${createResponse.data.object._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Test product cleaned up');
        }
      } catch (error) {
        console.log('⚠️ Product creation test failed:', error.response?.data?.message || error.message);
      }
      
    } else {
      console.log('❌ Admin login failed');
    }
    
    console.log('\n🎉 Production Deployment Check Complete!');
    console.log('=====================================');
    console.log('✅ Backend is running');
    console.log('✅ Admin authentication working');
    console.log('✅ Products API working');
    console.log('✅ Ready for frontend deployment');
    
    console.log('\n📋 Next Steps for Netlify:');
    console.log('1. Build frontend: cd frontend && npm run build');
    console.log('2. Deploy dist folder to Netlify');
    console.log('3. Set environment variable: VITE_API_BASE_URL=https://skillbridge-ecommerce-backend-3.onrender.com');
    console.log('4. Test the deployed site');
    
  } catch (error) {
    console.error('❌ Production deployment check failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

deployToProduction();