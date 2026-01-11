const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testSortAndFavorites() {
  console.log('🧪 Testing Sort and Favorites Functionality...\n');

  try {
    // Test 1: Test sorting functionality
    console.log('1. Testing product sorting...');
    
    const sortTests = [
      { sort: 'price_asc', label: 'Price: Low to High' },
      { sort: 'price_desc', label: 'Price: High to Low' },
      { sort: 'name_asc', label: 'Name: A to Z' },
      { sort: 'name_desc', label: 'Name: Z to A' }
    ];

    for (const test of sortTests) {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: { sort: test.sort, pageSize: 5 }
      });
      
      if (response.data.success && response.data.products.length > 0) {
        console.log(`✅ ${test.label} - Got ${response.data.products.length} products`);
        
        // Show first few products to verify sorting
        const products = response.data.products.slice(0, 3);
        products.forEach((product, index) => {
          if (test.sort.includes('price')) {
            console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
          } else {
            console.log(`   ${index + 1}. ${product.name}`);
          }
        });
      } else {
        console.log(`❌ ${test.label} - Failed or no products`);
      }
    }

    // Test 2: Test favorites endpoints (requires authentication)
    console.log('\n2. Testing favorites endpoints...');
    
    // First, try to register/login a test user
    let authToken = null;
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@skillbridge.com',
        password: 'Admin123!'
      });
      
      if (loginResponse.data.success) {
        authToken = loginResponse.data.token;
        console.log('✅ Authenticated as admin user');
      }
    } catch (error) {
      console.log('⚠️  Could not authenticate - favorites tests will be skipped');
      console.log('Error:', error.response?.data?.message);
    }

    if (authToken) {
      const headers = { Authorization: `Bearer ${authToken}` };
      
      // Get a product ID for testing
      const productsResponse = await axios.get(`${API_BASE_URL}/products?pageSize=1`);
      if (productsResponse.data.success && productsResponse.data.products.length > 0) {
        const testProductId = productsResponse.data.products[0]._id;
        console.log(`Using product: ${productsResponse.data.products[0].name}`);
        console.log(`Product ID: ${testProductId}`);
        
        // Test adding to favorites
        console.log('Testing add to favorites...');
        try {
          const addResponse = await axios.post(`${API_BASE_URL}/favorites/${testProductId}`, {}, { headers });
          if (addResponse.data.success) {
            console.log('✅ Successfully added product to favorites');
          }
        } catch (error) {
          if (error.response?.status === 400) {
            console.log('✅ Product already in favorites (expected behavior)');
          } else {
            console.log('❌ Failed to add to favorites:', error.response?.data?.message);
          }
        }
        
        // Test getting favorites
        try {
          const favoritesResponse = await axios.get(`${API_BASE_URL}/favorites`, { headers });
          if (favoritesResponse.data.success) {
            console.log(`✅ Retrieved favorites: ${favoritesResponse.data.data.length} items`);
            
            // If we have favorites, show them
            if (favoritesResponse.data.data.length > 0) {
              favoritesResponse.data.data.slice(0, 3).forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
              });
            }
          }
        } catch (error) {
          console.log('❌ Failed to get favorites:', error.response?.data?.message);
        }
        
        // Test removing from favorites
        try {
          const removeResponse = await axios.delete(`${API_BASE_URL}/favorites/${testProductId}`, { headers });
          if (removeResponse.data.success) {
            console.log('✅ Successfully removed product from favorites');
          }
        } catch (error) {
          console.log('❌ Failed to remove from favorites:', error.response?.data?.message);
        }
      }
    }

    console.log('\n🎉 Sort and Favorites functionality tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testSortAndFavorites();