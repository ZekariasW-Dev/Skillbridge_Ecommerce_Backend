const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testOrderCreation() {
  console.log('🧪 Testing Order Creation...\n');

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

    // Step 2: Get a product for testing
    console.log('\n2. Getting products for order...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?pageSize=2`);
    const products = productsResponse.data.products;
    
    if (products.length === 0) {
      console.log('❌ No products available for testing');
      return;
    }
    
    console.log(`✅ Got ${products.length} products for testing`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock})`);
    });

    // Step 3: Create test order
    console.log('\n3. Creating test order...');
    const orderData = {
      description: 'Test order from automated test',
      products: [
        {
          productId: products[0]._id,
          quantity: 1
        }
      ]
    };

    if (products.length > 1) {
      orderData.products.push({
        productId: products[1]._id,
        quantity: 2
      });
    }

    console.log('Order data:', JSON.stringify(orderData, null, 2));

    try {
      const orderResponse = await axios.post(`${API_BASE_URL}/orders`, orderData, { headers });
      
      if (orderResponse.data.success) {
        console.log('✅ Order created successfully!');
        console.log('Order details:', JSON.stringify(orderResponse.data.object, null, 2));
      } else {
        console.log('❌ Order creation failed:', orderResponse.data.message);
      }
    } catch (orderError) {
      console.log('❌ Order creation error:', orderError.response?.data?.message || orderError.message);
      if (orderError.response?.data?.errors) {
        console.log('Errors:', orderError.response.data.errors);
      }
    }

    // Step 4: Get user's orders
    console.log('\n4. Getting user orders...');
    try {
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, { headers });
      
      if (ordersResponse.data.success) {
        const orders = ordersResponse.data.object;
        console.log(`✅ Retrieved ${orders.length} orders`);
        
        if (orders.length > 0) {
          console.log('Recent orders:');
          orders.slice(0, 3).forEach((order, index) => {
            console.log(`   ${index + 1}. Order ${order.order_id} - ${order.status} - $${order.total_price}`);
            console.log(`      Description: ${order.description}`);
            console.log(`      Products: ${order.products.length} items`);
          });
        }
      }
    } catch (ordersError) {
      console.log('❌ Failed to get orders:', ordersError.response?.data?.message || ordersError.message);
    }

    console.log('\n🎉 Order creation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testOrderCreation();