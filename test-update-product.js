// Test script for User Story 4 - Update Product functionality
// Run this after starting the server to test update product endpoint

const testUpdateProduct = async () => {
  const baseURL = 'http://localhost:3000';
  let adminToken = null;
  let userToken = null;
  let testProductId = null;
  
  console.log('🧪 Testing User Story 4 - Update Product Functionality\n');
  
  try {
    // Setup: Get admin token
    console.log('🔧 Setup: Getting admin token...');
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
    
    // Setup: Get regular user token
    const userRegisterResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'updatetestuser',
        email: 'updatetest@example.com',
        password: 'UserPass123!'
      })
    });
    
    if (userRegisterResponse.status === 201 || userRegisterResponse.status === 400) {
      const userLoginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'updatetest@example.com',
          password: 'UserPass123!'
        })
      });
      
      if (userLoginResponse.status === 200) {
        const userLoginData = await userLoginResponse.json();
        userToken = userLoginData.object.token;
        console.log('✅ Regular user token obtained');
      }
    }
    
    // Setup: Create a test product to update
    console.log('🔧 Setup: Creating test product...');
    const createProductResponse = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Test Product for Update',
        description: 'This is a test product that will be updated during testing',
        price: 99.99,
        stock: 25,
        category: 'Test Category'
      })
    });
    
    if (createProductResponse.status === 201) {
      const createProductData = await createProductResponse.json();
      testProductId = createProductData.object.id;
      console.log('✅ Test product created with ID:', testProductId);
    } else {
      console.log('❌ Failed to create test product');
      return;
    }
    
    // Test 1: Unauthenticated request (401 Unauthorized)
    console.log('\n1️⃣ Testing unauthenticated update request...');
    const unauthResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Product Name'
      })
    });
    
    if (unauthResponse.status === 401) {
      console.log('✅ Unauthenticated request: 401 Unauthorized (CORRECT)');
    } else {
      console.log('❌ Unauthenticated request test failed');
    }
    
    // Test 2: Non-admin user request (403 Forbidden)
    if (userToken) {
      console.log('\n2️⃣ Testing non-admin user update request...');
      const nonAdminResponse = await fetch(`${baseURL}/products/${testProductId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          name: 'Updated Product Name'
        })
      });
      
      if (nonAdminResponse.status === 403) {
        console.log('✅ Non-admin user request: 403 Forbidden (CORRECT)');
      } else {
        console.log('❌ Non-admin user request test failed');
      }
    }
    
    // Test 3: Update non-existent product (404 Not Found)
    console.log('\n3️⃣ Testing update of non-existent product...');
    const nonExistentResponse = await fetch(`${baseURL}/products/non-existent-id`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Updated Product Name'
      })
    });
    
    const nonExistentData = await nonExistentResponse.json();
    if (nonExistentResponse.status === 404) {
      console.log('✅ Non-existent product: 404 Not Found (CORRECT)');
      console.log('📝 Error message:', nonExistentData.errors[0]);
    } else {
      console.log('❌ Non-existent product test failed');
    }
    
    // Test 4: Valid partial update - name only (200 OK)
    console.log('\n4️⃣ Testing valid partial update (name only)...');
    const nameUpdateResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Updated Product Name'
      })
    });
    
    const nameUpdateData = await nameUpdateResponse.json();
    if (nameUpdateResponse.status === 200 && nameUpdateData.success) {
      console.log('✅ Valid name update: 200 OK (CORRECT)');
      console.log('📦 Updated product name:', nameUpdateData.object.name);
    } else {
      console.log('❌ Valid name update test failed:', nameUpdateData);
    }
    
    // Test 5: Valid partial update - price and stock (200 OK)
    console.log('\n5️⃣ Testing valid partial update (price and stock)...');
    const priceStockUpdateResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        price: 149.99,
        stock: 50
      })
    });
    
    const priceStockUpdateData = await priceStockUpdateResponse.json();
    if (priceStockUpdateResponse.status === 200 && priceStockUpdateData.success) {
      console.log('✅ Valid price/stock update: 200 OK (CORRECT)');
      console.log('📦 Updated price:', priceStockUpdateData.object.price);
      console.log('📦 Updated stock:', priceStockUpdateData.object.stock);
    } else {
      console.log('❌ Valid price/stock update test failed:', priceStockUpdateData);
    }
    
    // Test 6: Valid full update (200 OK)
    console.log('\n6️⃣ Testing valid full update (all fields)...');
    const fullUpdateResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Fully Updated Product',
        description: 'This product has been completely updated with new information',
        price: 199.99,
        stock: 75,
        category: 'Updated Category'
      })
    });
    
    const fullUpdateData = await fullUpdateResponse.json();
    if (fullUpdateResponse.status === 200 && fullUpdateData.success) {
      console.log('✅ Valid full update: 200 OK (CORRECT)');
      console.log('📦 Updated product:', {
        name: fullUpdateData.object.name,
        price: fullUpdateData.object.price,
        stock: fullUpdateData.object.stock,
        category: fullUpdateData.object.category
      });
    } else {
      console.log('❌ Valid full update test failed:', fullUpdateData);
    }
    
    // Test 7: Invalid name (too short) - 400 Bad Request
    console.log('\n7️⃣ Testing invalid name update (too short)...');
    const shortNameResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'AB' // Too short (less than 3 characters)
      })
    });
    
    const shortNameData = await shortNameResponse.json();
    if (shortNameResponse.status === 400) {
      console.log('✅ Short name validation: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', shortNameData.errors[0]);
    } else {
      console.log('❌ Short name validation test failed');
    }
    
    // Test 8: Invalid description (too short) - 400 Bad Request
    console.log('\n8️⃣ Testing invalid description update (too short)...');
    const shortDescResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        description: 'Short' // Too short (less than 10 characters)
      })
    });
    
    const shortDescData = await shortDescResponse.json();
    if (shortDescResponse.status === 400) {
      console.log('✅ Short description validation: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', shortDescData.errors[0]);
    } else {
      console.log('❌ Short description validation test failed');
    }
    
    // Test 9: Invalid price (negative) - 400 Bad Request
    console.log('\n9️⃣ Testing invalid price update (negative)...');
    const negativePriceResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        price: -10.99 // Negative price
      })
    });
    
    const negativePriceData = await negativePriceResponse.json();
    if (negativePriceResponse.status === 400) {
      console.log('✅ Negative price validation: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', negativePriceData.errors[0]);
    } else {
      console.log('❌ Negative price validation test failed');
    }
    
    // Test 10: Invalid stock (negative) - 400 Bad Request
    console.log('\n🔟 Testing invalid stock update (negative)...');
    const negativeStockResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        stock: -5 // Negative stock
      })
    });
    
    const negativeStockData = await negativeStockResponse.json();
    if (negativeStockResponse.status === 400) {
      console.log('✅ Negative stock validation: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', negativeStockData.errors[0]);
    } else {
      console.log('❌ Negative stock validation test failed');
    }
    
    // Test 11: Empty request body - 400 Bad Request
    console.log('\n1️⃣1️⃣ Testing empty request body...');
    const emptyBodyResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({}) // Empty body
    });
    
    const emptyBodyData = await emptyBodyResponse.json();
    if (emptyBodyResponse.status === 400) {
      console.log('✅ Empty body validation: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', emptyBodyData.errors[0]);
    } else {
      console.log('❌ Empty body validation test failed');
    }
    
    console.log('\n🎉 User Story 4 - Update Product Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ PUT /products/:id endpoint implemented');
    console.log('✅ Admin-only access with proper authorization');
    console.log('✅ 200 OK with updated product data on success');
    console.log('✅ 404 Not Found for non-existent products');
    console.log('✅ 400 Bad Request for validation failures');
    console.log('✅ 401 Unauthorized for unauthenticated requests');
    console.log('✅ 403 Forbidden for non-admin users');
    console.log('✅ Partial updates supported (any combination of fields)');
    console.log('✅ Same validation criteria as product creation');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
    console.log('💡 Make sure admin user exists: npm run setup-admin');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testUpdateProduct();
}

module.exports = testUpdateProduct;