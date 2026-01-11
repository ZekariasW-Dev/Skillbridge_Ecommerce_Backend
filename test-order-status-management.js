const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testOrderStatusManagement() {
  console.log('🧪 Testing Order Status Management...\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@skillbridge.com',
      password: 'Admin123!'
    });
    
    const authToken = loginResponse.data.object.token;
    const headers = { Authorization: `Bearer ${authToken}` };
    console.log('✅ Login successful');

    // Step 2: Get existing orders
    console.log('\n2. Getting existing orders...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, { headers });
    
    if (ordersResponse.data.success && ordersResponse.data.object.length > 0) {
      const orders = ordersResponse.data.object;
      console.log(`✅ Found ${orders.length} existing orders`);
      
      const testOrder = orders[0];
      console.log(`Using order: ${testOrder.order_id} (Status: ${testOrder.status})`);

      // Step 3: Test status updates
      console.log('\n3. Testing status updates...');
      const statusFlow = ['processing', 'shipped', 'delivered'];
      
      for (const newStatus of statusFlow) {
        try {
          console.log(`   Updating to: ${newStatus}`);
          const updateResponse = await axios.patch(
            `${API_BASE_URL}/orders/${testOrder.order_id}/status`,
            { status: newStatus },
            { headers }
          );
          
          if (updateResponse.data.success) {
            console.log(`   ✅ Status updated to: ${updateResponse.data.object.status}`);
          } else {
            console.log(`   ❌ Failed to update status: ${updateResponse.data.message}`);
          }
        } catch (error) {
          console.log(`   ❌ Error updating to ${newStatus}:`, error.response?.data?.message || error.message);
        }
      }

      // Step 4: Verify final status
      console.log('\n4. Verifying final order status...');
      const finalOrdersResponse = await axios.get(`${API_BASE_URL}/orders`, { headers });
      
      if (finalOrdersResponse.data.success) {
        const updatedOrder = finalOrdersResponse.data.object.find(o => o.order_id === testOrder.order_id);
        if (updatedOrder) {
          console.log(`✅ Final order status: ${updatedOrder.status}`);
        }
      }

      // Step 5: Test invalid status
      console.log('\n5. Testing invalid status...');
      try {
        await axios.patch(
          `${API_BASE_URL}/orders/${testOrder.order_id}/status`,
          { status: 'invalid_status' },
          { headers }
        );
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('✅ Invalid status properly rejected');
        } else {
          console.log('❌ Unexpected error for invalid status');
        }
      }

    } else {
      console.log('❌ No existing orders found. Creating a test order first...');
      
      // Create a test order
      const productsResponse = await axios.get(`${API_BASE_URL}/products?pageSize=1`);
      if (productsResponse.data.success && productsResponse.data.products.length > 0) {
        const product = productsResponse.data.products[0];
        
        const orderData = {
          description: 'Test order for status management',
          products: [{ productId: product._id, quantity: 1 }]
        };
        
        const newOrderResponse = await axios.post(`${API_BASE_URL}/orders`, orderData, { headers });
        if (newOrderResponse.data.success) {
          console.log('✅ Test order created, please run the test again');
        }
      }
    }

    console.log('\n🎉 Order status management test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testOrderStatusManagement();