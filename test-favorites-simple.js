const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testFavorites() {
  console.log('🧪 Testing Favorites Functionality...\n');

  try {
    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@skillbridge.com',
      password: 'Admin123!'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      console.log('Response:', loginResponse.data);
      return;
    }
    
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const authToken = loginResponse.data.object.token;
    if (!authToken) {
      console.log('❌ No token in response');
      return;
    }
    
    const headers = { Authorization: `Bearer ${authToken}` };
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    console.log(`   User: ${loginResponse.data.object.user?.email}`);

    // Get a product for testing
    console.log('\n2. Getting a product for testing...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?pageSize=1`);
    
    if (!productsResponse.data.success || productsResponse.data.products.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    const testProduct = productsResponse.data.products[0];
    console.log(`✅ Using product: ${testProduct.name}`);
    console.log(`   Product ID: ${testProduct._id}`);

    // Test getting initial favorites
    console.log('\n3. Getting initial favorites...');
    try {
      const initialFavoritesResponse = await axios.get(`${API_BASE_URL}/favorites`, { headers });
      console.log('Initial favorites response:', JSON.stringify(initialFavoritesResponse.data, null, 2));
      console.log(`✅ Initial favorites: ${initialFavoritesResponse.data.object?.length || 0} items`);
    } catch (error) {
      console.log('❌ Failed to get initial favorites:', error.response?.data?.message || error.message);
    }

    // Test adding to favorites
    console.log('\n4. Adding product to favorites...');
    try {
      const addResponse = await axios.post(`${API_BASE_URL}/favorites/${testProduct._id}`, {}, { headers });
      if (addResponse.data.success) {
        console.log('✅ Successfully added product to favorites');
      } else {
        console.log('❌ Failed to add to favorites:', addResponse.data.message);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Product already in favorites (expected behavior)');
      } else {
        console.log('❌ Failed to add to favorites:', error.response?.data?.message || error.message);
      }
    }

    // Test getting favorites after adding
    console.log('\n5. Getting favorites after adding...');
    try {
      const favoritesResponse = await axios.get(`${API_BASE_URL}/favorites`, { headers });
      if (favoritesResponse.data.success) {
        console.log(`✅ Current favorites: ${favoritesResponse.data.object.length} items`);
        
        if (favoritesResponse.data.object.length > 0) {
          console.log('   Favorite products:');
          favoritesResponse.data.object.forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Failed to get favorites:', error.response?.data?.message || error.message);
    }

    // Test removing from favorites
    console.log('\n6. Removing product from favorites...');
    try {
      const removeResponse = await axios.delete(`${API_BASE_URL}/favorites/${testProduct._id}`, { headers });
      if (removeResponse.data.success) {
        console.log('✅ Successfully removed product from favorites');
      } else {
        console.log('❌ Failed to remove from favorites:', removeResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Failed to remove from favorites:', error.response?.data?.message || error.message);
    }

    // Test getting favorites after removing
    console.log('\n7. Getting favorites after removing...');
    try {
      const finalFavoritesResponse = await axios.get(`${API_BASE_URL}/favorites`, { headers });
      console.log(`✅ Final favorites: ${finalFavoritesResponse.data.object.length} items`);
    } catch (error) {
      console.log('❌ Failed to get final favorites:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Favorites functionality test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testFavorites();