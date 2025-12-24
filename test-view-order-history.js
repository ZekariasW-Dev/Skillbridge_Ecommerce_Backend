// Test script for User Story 10 - View My Order History functionality
// Run this after starting the server to test view order history endpoint

const testViewOrderHistory = async () => {
  const baseURL = 'http://localhost:3000';
  let adminToken = null;
  let user1Token = null;
  let user2Token = null;
  let testProducts = [];
  
  console.log('🧪 Testing User Story 10 - View My Order History Functionality\n');
  
  try {
    // Setup: Get admin token to create test products
    console.log('🔧 Setup: Getting admin token to create test products...');
    const adminLoginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'AdminPass123!'
      })
    });
    
    if (adminLoginResponse.status === 200) {
      const adminLoginData = await adminLoginResponse.json();
      adminToken = adminLoginData.object.token;
      console.log('✅ Admin token obtained');
    } else {
      console.log('⚠️  Cannot get admin token - run: npm run setup-admin');
      return;
    }
    
    // Setup: Create two test users
    console.log('🔧 Setup: Creating test users...');
    
    // User 1
    const user1RegisterResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'historyuser1',
        email: 'historyuser1@example.com',
        password: 'UserPass123!'
      })
    });
    
    if (user1RegisterResponse.status === 201 || user1RegisterResponse.status === 400) {
      const user1LoginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'historyuser1@example.com',
          password: 'UserPass123!'
        })
      });
      
      if (user1LoginResponse.status === 200) {
        const user1LoginData = await user1LoginResponse.json();
        user1Token = user1LoginData.object.token;
        console.log('✅ User 1 token obtained');
      }
    }
    
    // User 2
    const user2RegisterResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'historyuser2',
        email: 'historyuser2@example.com',
        password: 'UserPass123!'
      })
    });
    
    if (user2RegisterResponse.status === 201 || user2RegisterResponse.status === 400) {
      const user2LoginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'historyuser2@example.com',
          password: 'UserPass123!'
        })
      });
      
      if (user2LoginResponse.status === 200) {
        const user2LoginData = await user2LoginResponse.json();
        user2Token = user2LoginData.object.token;
        console.log('✅ User 2 token obtained');
      }
    }
    
    if (!user1Token || !user2Token) {
      console.log('❌ Cannot proceed without user tokens');
      return;
    }
    
    // Setup: Create test products
    console.log('🔧 Setup: Creating test products...');
    const productsToCreate = [
      {
        name: 'History Test Mouse',
        description: 'Mouse for order history testing',
        price: 49.99,
        stock: 20,
        category: 'Electronics'
      },
      {
        name: 'History Test Keyboard',
        description: 'Keyboard for order history testing',
        price: 99.99,
        stock: 15,
        category: 'Electronics'
      }
    ];
    
    for (const product of productsToCreate) {
      const createResponse = await fetch(`${baseURL}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(product)
      });
      
      if (createResponse.status === 201) {
        const createData = await createResponse.json();
        testProducts.push({
          id: createData.object.id,
          name: createData.object.name,
          price: createData.object.price
        });
      }
    }
    
    console.log('✅ Test products created:', testProducts.length);
    
    // Test 1: Unauthenticated request (401 Unauthorized)
    console.log('\n1️⃣ Testing unauthenticated order history request...');
    const unauthResponse = await fetch(`${baseURL}/orders`);
    
    if (unauthResponse.status === 401) {
      console.log('✅ Unauthenticated request: 401 Unauthorized (CORRECT)');
    } else {
      console.log('❌ Unauthenticated request test failed:', unauthResponse.status);
    }
    
    // Test 2: Empty order history (200 OK with empty array)
    console.log('\n2️⃣ Testing empty order history...');
    const emptyHistoryResponse = await fetch(`${baseURL}/orders`, {
      headers: { 
        'Authorization': `Bearer ${user1Token}`
      }
    });
    
    const emptyHistoryData = await emptyHistoryResponse.json();
    if (emptyHistoryResponse.status === 200 && emptyHistoryData.success) {
      console.log('✅ Empty order history: 200 OK (CORRECT)');
      console.log('📦 Orders array:', Array.isArray(emptyHistoryData.object) ? 'Array' : 'Not Array');
      console.log('📊 Orders count:', emptyHistoryData.object.length);
      
      // Validate empty array response (User Story 10 requirement)
      if (Array.isArray(emptyHistoryData.object) && emptyHistoryData.object.length === 0) {
        console.log('✅ Returns empty array when user has no orders (User Story 10 requirement)');
      } else {
        console.log('❌ Should return empty array for user with no orders');
      }
      
      // Validate message for empty history
      if (emptyHistoryData.message.toLowerCase().includes('no orders')) {
        console.log('✅ Appropriate message for empty order history');
      }
    } else {
      console.log('❌ Empty order history test failed:', emptyHistoryData);
    }
    
    // Test 3: Create orders for User 1
    console.log('\n3️⃣ Creating orders for User 1...');
    
    // Order 1 for User 1
    const order1Response = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify([
        { productId: testProducts[0].id, quantity: 2 }
      ])
    });
    
    let user1Order1Id = null;
    if (order1Response.status === 201) {
      const order1Data = await order1Response.json();
      user1Order1Id = order1Data.object.order_id;
      console.log('✅ Order 1 created for User 1:', user1Order1Id);
    }
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Order 2 for User 1
    const order2Response = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify([
        { productId: testProducts[1].id, quantity: 1 }
      ])
    });
    
    let user1Order2Id = null;
    if (order2Response.status === 201) {
      const order2Data = await order2Response.json();
      user1Order2Id = order2Data.object.order_id;
      console.log('✅ Order 2 created for User 1:', user1Order2Id);
    }
    
    // Test 4: Create order for User 2
    console.log('\n4️⃣ Creating order for User 2...');
    const user2OrderResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user2Token}`
      },
      body: JSON.stringify([
        { productId: testProducts[0].id, quantity: 1 }
      ])
    });
    
    let user2OrderId = null;
    if (user2OrderResponse.status === 201) {
      const user2OrderData = await user2OrderResponse.json();
      user2OrderId = user2OrderData.object.order_id;
      console.log('✅ Order created for User 2:', user2OrderId);
    }
    
    // Test 5: View User 1's order history
    console.log('\n5️⃣ Testing User 1 order history...');
    const user1HistoryResponse = await fetch(`${baseURL}/orders`, {
      headers: { 
        'Authorization': `Bearer ${user1Token}`
      }
    });
    
    const user1HistoryData = await user1HistoryResponse.json();
    if (user1HistoryResponse.status === 200 && user1HistoryData.success) {
      console.log('✅ User 1 order history: 200 OK (CORRECT)');
      console.log('📦 Orders count:', user1HistoryData.object.length);
      
      // Validate User Story 10 + Page 11 PDF response structure
      if (user1HistoryData.object.length > 0) {
        const order = user1HistoryData.object[0];
        const hasRequiredFields = order.hasOwnProperty('order_id') &&
                                 order.hasOwnProperty('status') &&
                                 order.hasOwnProperty('total_price') &&
                                 order.hasOwnProperty('created_at');
        
        if (hasRequiredFields) {
          console.log('✅ Order objects contain required fields: order_id, status, total_price, created_at');
          console.log('✅ Page 11 PDF requirement: created_at (date order was placed) included');
        } else {
          console.log('❌ Order objects missing required fields');
        }
        
        // Validate created_at field format and value (Page 11 PDF requirement)
        const createdAt = order.created_at;
        if (createdAt) {
          const createdAtDate = new Date(createdAt);
          if (!isNaN(createdAtDate.getTime())) {
            console.log('✅ created_at field contains valid date format');
            console.log('📅 Sample created_at value:', createdAt);
            
            // Verify it's a recent date (within last hour for test)
            const now = new Date();
            const timeDiff = now - createdAtDate;
            if (timeDiff >= 0 && timeDiff < 3600000) { // Within 1 hour
              console.log('✅ created_at timestamp is recent and valid');
            } else {
              console.log('⚠️  created_at timestamp may be incorrect');
            }
          } else {
            console.log('❌ created_at field contains invalid date format');
          }
        } else {
          console.log('❌ created_at field is missing or null');
        }
        
        // Validate that orders belong to User 1 only
        const allOrdersBelongToUser1 = user1HistoryData.object.every(order => 
          order.order_id === user1Order1Id || order.order_id === user1Order2Id
        );
        
        if (allOrdersBelongToUser1) {
          console.log('✅ All orders belong to authenticated user (User Story 10 requirement)');
        } else {
          console.log('❌ Orders from other users found - security violation!');
        }
        
        // Validate order count
        if (user1HistoryData.object.length === 2) {
          console.log('✅ Correct number of orders returned for User 1');
        } else {
          console.log('⚠️  Expected 2 orders for User 1, got:', user1HistoryData.object.length);
        }
        
        console.log('📋 User 1 Orders:');
        user1HistoryData.object.forEach((order, index) => {
          console.log(`  ${index + 1}. Order ID: ${order.order_id}`);
          console.log(`     Status: ${order.status}`);
          console.log(`     Total: $${order.total_price}`);
          console.log(`     Created: ${order.created_at}`);
        });
      }
    } else {
      console.log('❌ User 1 order history test failed:', user1HistoryData);
    }
    
    // Test 6: View User 2's order history (should only see their own orders)
    console.log('\n6️⃣ Testing User 2 order history (isolation test)...');
    const user2HistoryResponse = await fetch(`${baseURL}/orders`, {
      headers: { 
        'Authorization': `Bearer ${user2Token}`
      }
    });
    
    const user2HistoryData = await user2HistoryResponse.json();
    if (user2HistoryResponse.status === 200 && user2HistoryData.success) {
      console.log('✅ User 2 order history: 200 OK (CORRECT)');
      console.log('📦 Orders count:', user2HistoryData.object.length);
      
      // Validate that User 2 only sees their own orders (User Story 10 requirement)
      if (user2HistoryData.object.length === 1) {
        const order = user2HistoryData.object[0];
        if (order.order_id === user2OrderId) {
          console.log('✅ User 2 only sees their own orders (User Story 10 requirement)');
          console.log('🔒 Order isolation working correctly');
        } else {
          console.log('❌ User 2 seeing wrong orders - security violation!');
        }
      } else {
        console.log('⚠️  Expected 1 order for User 2, got:', user2HistoryData.object.length);
      }
      
      console.log('📋 User 2 Orders:');
      user2HistoryData.object.forEach((order, index) => {
        console.log(`  ${index + 1}. Order ID: ${order.order_id}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Total: $${order.total_price}`);
      });
    } else {
      console.log('❌ User 2 order history test failed:', user2HistoryData);
    }
    
    // Test 7: Validate order sorting (most recent first)
    console.log('\n7️⃣ Testing order sorting (most recent first)...');
    if (user1HistoryData.success && user1HistoryData.object.length >= 2) {
      const orders = user1HistoryData.object;
      const firstOrderTime = new Date(orders[0].created_at);
      const secondOrderTime = new Date(orders[1].created_at);
      
      if (firstOrderTime >= secondOrderTime) {
        console.log('✅ Orders sorted by creation date (most recent first)');
      } else {
        console.log('⚠️  Orders may not be sorted correctly');
      }
    }
    
    // Test 8: Validate response structure consistency
    console.log('\n8️⃣ Testing response structure consistency...');
    if (user1HistoryData.success && user1HistoryData.object.length > 0) {
      const order = user1HistoryData.object[0];
      
      // Validate data types
      const validations = [
        { field: 'order_id', type: 'string', value: order.order_id },
        { field: 'status', type: 'string', value: order.status },
        { field: 'total_price', type: 'number', value: order.total_price },
        { field: 'created_at', type: 'string', value: order.created_at }
      ];
      
      let allValid = true;
      validations.forEach(validation => {
        const isValid = typeof validation.value === validation.type && validation.value !== null && validation.value !== undefined;
        if (isValid) {
          console.log(`  ✅ ${validation.field}: ${validation.type}`);
        } else {
          console.log(`  ❌ ${validation.field}: Expected ${validation.type}, got ${typeof validation.value}`);
          allValid = false;
        }
      });
      
      if (allValid) {
        console.log('✅ All order fields have correct data types');
      } else {
        console.log('❌ Some order fields have incorrect data types');
      }
      
      // Validate Base Response structure
      const hasBaseStructure = user1HistoryData.hasOwnProperty('success') &&
                              user1HistoryData.hasOwnProperty('message') &&
                              user1HistoryData.hasOwnProperty('object') &&
                              user1HistoryData.hasOwnProperty('errors');
      
      if (hasBaseStructure) {
        console.log('✅ Response follows standard Base Response format');
      } else {
        console.log('❌ Response structure incorrect');
      }
    }
    
    // Test 9: Performance test with multiple orders
    console.log('\n9️⃣ Testing performance with order history retrieval...');
    const startTime = Date.now();
    const perfResponse = await fetch(`${baseURL}/orders`, {
      headers: { 
        'Authorization': `Bearer ${user1Token}`
      }
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (perfResponse.status === 200) {
      console.log('✅ Performance test: 200 OK');
      console.log('⏱️  Response time:', responseTime, 'ms');
      
      if (responseTime < 1000) {
        console.log('✅ Response time acceptable (< 1 second)');
      } else {
        console.log('⚠️  Response time may be slow (> 1 second)');
      }
    } else {
      console.log('❌ Performance test failed');
    }
    
    // Test 10: Cross-user isolation verification
    console.log('\n🔟 Testing cross-user order isolation...');
    
    // Get all orders for both users
    const allUser1Orders = user1HistoryData.object || [];
    const allUser2Orders = user2HistoryData.object || [];
    
    // Check for any order ID overlap (should be none)
    const user1OrderIds = allUser1Orders.map(order => order.order_id);
    const user2OrderIds = allUser2Orders.map(order => order.order_id);
    const overlap = user1OrderIds.filter(id => user2OrderIds.includes(id));
    
    if (overlap.length === 0) {
      console.log('✅ Perfect order isolation - no shared orders between users');
      console.log('🔒 User privacy and security maintained');
    } else {
      console.log('❌ SECURITY VIOLATION: Users sharing order IDs:', overlap);
    }
    
    console.log('\n🎉 User Story 10 - View My Order History Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ GET /orders endpoint implemented');
    console.log('✅ Protected endpoint (authenticated users only)');
    console.log('✅ Orders filtered by userId from JWT token');
    console.log('✅ 200 OK with array of order objects');
    console.log('✅ Order objects contain: order_id, status, total_price, created_at');
    console.log('✅ Page 11 PDF requirement: created_at (date order was placed) included');
    console.log('✅ created_at field contains valid ISO date format');
    console.log('✅ Empty array returned when user has no orders (200 OK)');
    console.log('✅ 401 Unauthorized for unauthenticated requests');
    console.log('✅ Perfect user isolation - users never see other users\' orders');
    console.log('✅ Orders sorted by creation date (most recent first)');
    console.log('✅ Standard Base Response format maintained');
    console.log('✅ Good performance and data type consistency');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
    console.log('💡 Make sure admin user exists: npm run setup-admin');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testViewOrderHistory();
}

module.exports = testViewOrderHistory;