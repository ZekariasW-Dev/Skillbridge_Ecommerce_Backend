const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testCompleteFavoritesFlow() {
  console.log('🧪 Testing Complete Favorites Flow...\n');

  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@skillbridge.com',
      password: 'Admin123!'
    });
    
    const authToken = loginResponse.data.object.token;
    const headers = { Authorization: `Bearer ${authToken}` };
    console.log('✅ Login successful');

    // Step 2: Get products
    console.log('\n2. Getting products...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?pageSize=3`);
    const products = productsResponse.data.products;
    console.log(`✅ Got ${products.length} products`);
    
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
    });

    // Step 3: Add products to favorites
    console.log('\n3. Adding products to favorites...');
    for (let i = 0; i < Math.min(2, products.length); i++) {
      const product = products[i];
      try {
        await axios.post(`${API_BASE_URL}/favorites/${product._id}`, {}, { headers });
        console.log(`✅ Added "${product.name}" to favorites`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`✅ "${product.name}" already in favorites`);
        } else {
          console.log(`❌ Failed to add "${product.name}":`, error.response?.data?.message);
        }
      }
    }

    // Step 4: Get favorites
    console.log('\n4. Getting favorites...');
    const favoritesResponse = await axios.get(`${API_BASE_URL}/favorites`, { headers });
    const favorites = favoritesResponse.data.object;
    console.log(`✅ Current favorites: ${favorites.length} items`);
    
    if (favorites.length > 0) {
      console.log('   Favorite products:');
      favorites.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
      });
    }

    // Step 5: Test frontend endpoints
    console.log('\n5. Testing frontend accessibility...');
    try {
      const frontendResponse = await axios.get('http://localhost:3001', { timeout: 5000 });
      if (frontendResponse.status === 200) {
        console.log('✅ Frontend is accessible at http://localhost:3001');
        console.log('✅ You can now:');
        console.log('   - Visit http://localhost:3001');
        console.log('   - Login with admin@skillbridge.com / Admin123!');
        console.log('   - Click the heart icon in the navbar to view favorites');
        console.log('   - Click heart icons on product cards to add/remove favorites');
      }
    } catch (error) {
      console.log('❌ Frontend not accessible. Make sure it\'s running on http://localhost:3001');
    }

    // Step 6: Instructions for testing
    console.log('\n6. Manual Testing Instructions:');
    console.log('   📱 Open browser: http://localhost:3001');
    console.log('   🔐 Login: admin@skillbridge.com / Admin123!');
    console.log('   ❤️  Click heart icon in navbar (should show favorites count)');
    console.log('   📄 Should navigate to /favorites page');
    console.log('   🛍️  Go to /products and click heart icons on product cards');
    console.log('   🔄 Heart should toggle between filled/empty');
    console.log('   📊 Navbar badge should update with favorites count');

    console.log('\n🎉 Complete favorites flow test completed!');
    console.log(`📊 Current favorites count: ${favorites.length}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testCompleteFavoritesFlow();