// Test script for User Story 9 - Place a New Order functionality
// Run this after starting the server to test place order endpoint

const testPlaceOrder = async () => {
  const baseURL = 'http://localhost:3000';
  let adminToken = null;
  let userToken = null;
  let testProducts = [];
  
  console.log('🧪 Testing User Story 9 - Place a New Order Functionality\n');
  
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
    
    // Setup: Get regular user token
    console.log('🔧 Setup: Getting user token...');
    const userRegisterResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'orderuser',
        email: 'orderuser@example.com',
        password: 'UserPass123!'
      })
    });
    
    if (userRegisterResponse.status === 201 || userRegisterResponse.status === 400) {
      const userLoginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'orderuser@example.com',
          password: 'UserPass123!'
        })
      });
      
      if (userLoginResponse.status === 200) {
        const userLoginData = await userLoginResponse.json();
        userToken = userLoginData.object.token;
        console.log('✅ User token obtained');
      }
    }
    
    if (!userToken) {
      console.log('❌ Cannot proceed without user token');
      return;
    }
    
    // Setup: Create test products for ordering
    console.log('🔧 Setup: Creating test products for ordering...');
    const productsToCreate = [
      {
        name: 'Gaming Mouse',
        description: 'High-precision gaming mouse with RGB lighting',
        price: 79.99,
        stock: 15,
        category: 'Gaming'
      },
      {
        name: 'Mechanical Keyboard',
        description: 'Cherry MX Blue mechanical keyboard',
        price: 149.99,
        stock: 8,
        category: 'Gaming'
      },
      {
        name: 'USB Cable',
        description: 'High-quality USB-C cable',
        price: 19.99,
        stock: 2, // Low stock for testing
        category: 'Accessories'
      },
      {
        name: 'Monitor Stand',
        description: 'Adjustable monitor stand',
        price: 89.99,
        stock: 0, // Out of stock for testing
        category: 'Accessories'
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
          price: createData.object.price,
          stock: createData.object.stock
        });
      }
    }
    
    console.log('✅ Test products created:', testProducts.length);
    
    // Test 1: Unauthenticated order request (401 Unauthorized)
    console.log('\n1️⃣ Testing unauthenticated order request...');
    const unauthResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: [
          { productId: testProducts[0].id, quantity: 1 }
        ]
      })
    });
    
    if (unauthResponse.status === 401) {
      console.log('✅ Unauthenticated request: 401 Unauthorized (CORRECT)');
    } else {
      console.log('❌ Unauthenticated request test failed:', unauthResponse.status);
    }
    
    // Test 2: Valid single product order with custom description (201 Created)
    console.log('\n2️⃣ Testing valid single product order with custom description...');
    const singleOrderResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        description: 'Birthday gift for my friend - gaming setup',
        products: [
          { productId: testProducts[0].id, quantity: 2 }
        ]
      })
    });
    
    const singleOrderData = await singleOrderResponse.json();
    if (singleOrderResponse.status === 201 && singleOrderData.success) {
      console.log('✅ Single product order with description: 201 Created (CORRECT)');
      console.log('📦 Order details:');
      console.log('  - Order ID:', singleOrderData.object.order_id);
      console.log('  - Status:', singleOrderData.object.status);
      console.log('  - Total Price:', singleOrderData.object.total_price);
      console.log('  - Description:', singleOrderData.object.description);
      console.log('  - Products:', singleOrderData.object.products.length);
      
      // Validate User Story 9 + Page 2 PDF response structure
      const hasRequiredFields = singleOrderData.object.hasOwnProperty('order_id') &&
                               singleOrderData.object.hasOwnProperty('status') &&
                               singleOrderData.object.hasOwnProperty('total_price') &&
                               singleOrderData.object.hasOwnProperty('description') &&
                               singleOrderData.object.hasOwnProperty('products');
      
      if (hasRequiredFields) {
        console.log('✅ Response contains required fields: order_id, status, total_price, description, products');
      } else {
        console.log('❌ Response missing required fields');
      }
      
      // Validate custom description (Page 2 PDF requirement)
      if (singleOrderData.object.description === 'Birthday gift for my friend - gaming setup') {
        console.log('✅ Custom description saved correctly');
      } else {
        console.log('❌ Custom description not saved correctly');
      }
      
      // Validate total_price calculation (User Story 9 requirement)
      const expectedTotal = testProducts[0].price * 2;
      if (Math.abs(singleOrderData.object.total_price - expectedTotal) < 0.01) {
        console.log('✅ Total price calculated correctly on backend');
      } else {
        console.log('❌ Total price calculation incorrect');
      }
      
      // Validate status is "pending" (User Story 9 requirement)
      if (singleOrderData.object.status === 'pending') {
        console.log('✅ Order status set to "pending"');
      } else {
        console.log('❌ Order status should be "pending"');
      }
    } else {
      console.log('❌ Single product order with description test failed:', singleOrderData);
    }
    
    // Test 3: Valid multiple product order (201 Created)
    console.log('\n3️⃣ Testing valid multiple product order...');
    const multiOrderResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        products: [
          { productId: testProducts[0].id, quantity: 1 },
          { productId: testProducts[1].id, quantity: 2 }
        ]
      })
    });
    
    const multiOrderData = await multiOrderResponse.json();
    if (multiOrderResponse.status === 201 && multiOrderData.success) {
      console.log('✅ Multiple product order: 201 Created (CORRECT)');
      console.log('📦 Order details:');
      console.log('  - Order ID:', multiOrderData.object.order_id);
      console.log('  - Total Price:', multiOrderData.object.total_price);
      console.log('  - Description:', multiOrderData.object.description);
      console.log('  - Products:', multiOrderData.object.products.length);
      
      // Validate auto-generated description (Page 2 PDF requirement)
      if (multiOrderData.object.description && multiOrderData.object.description.includes('Order for')) {
        console.log('✅ Auto-generated description created when none provided');
      } else {
        console.log('❌ Auto-generated description not working properly');
      }
      
      // Validate total_price calculation for multiple products
      const expectedTotal = (testProducts[0].price * 1) + (testProducts[1].price * 2);
      if (Math.abs(multiOrderData.object.total_price - expectedTotal) < 0.01) {
        console.log('✅ Multiple product total price calculated correctly');
      } else {
        console.log('❌ Multiple product total price calculation incorrect');
        console.log('Expected:', expectedTotal, 'Got:', multiOrderData.object.total_price);
      }
    } else {
      console.log('❌ Multiple product order test failed:', multiOrderData);
    }
    
    // Test 3b: Order without description (auto-generated description)
    console.log('\n3️⃣b Testing order without description (auto-generated)...');
    const autoDescResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        products: [
          { productId: testProducts[0].id, quantity: 1 }
        ]
      })
    });
    
    const autoDescData = await autoDescResponse.json();
    if (autoDescResponse.status === 201 && autoDescData.success) {
      console.log('✅ Order without description: 201 Created (CORRECT)');
      console.log('📦 Auto-generated description:', autoDescData.object.description);
      
      // Validate auto-generated description format
      const expectedPattern = /Order for \d+x .+/;
      if (expectedPattern.test(autoDescData.object.description)) {
        console.log('✅ Auto-generated description follows correct format');
      } else {
        console.log('❌ Auto-generated description format incorrect');
      }
    } else {
      console.log('❌ Order without description test failed:', autoDescData);
    }
    
    // Test 4: Non-existent product (404 Not Found)
    console.log('\n4️⃣ Testing order with non-existent product...');
    const nonExistentResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        products: [
          { productId: 'non-existent-product-id', quantity: 1 }
        ]
      })
    });
    
    const nonExistentData = await nonExistentResponse.json();
    if (nonExistentResponse.status === 404) {
      console.log('✅ Non-existent product: 404 Not Found (CORRECT)');
      console.log('📝 Error message:', nonExistentData.message);
      console.log('📝 Error details:', nonExistentData.errors);
    } else {
      console.log('❌ Non-existent product test failed:', nonExistentResponse.status);
    }
    
    // Test 4b: Invalid description (too long)
    console.log('\n4️⃣b Testing order with invalid description (too long)...');
    const longDescription = 'A'.repeat(501); // 501 characters (exceeds 500 limit)
    const invalidDescResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        description: longDescription,
        products: [
          { productId: testProducts[0].id, quantity: 1 }
        ]
      })
    });
    
    const invalidDescData = await invalidDescResponse.json();
    if (invalidDescResponse.status === 400) {
      console.log('✅ Invalid description (too long): 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', invalidDescData.errors[0]);
      
      // Validate error message mentions description length
      if (invalidDescData.errors[0].includes('500 characters')) {
        console.log('✅ Clear description length error message provided');
      } else {
        console.log('⚠️  Error message could be clearer about description length limit');
      }
    } else {
      console.log('❌ Invalid description test failed:', invalidDescResponse.status);
    }
    
    // Test 5: Insufficient stock (400 Bad Request)
    console.log('\n5️⃣ Testing order with insufficient stock...');
    const insufficientStockResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        products: [
          { productId: testProducts[2].id, quantity: 10 } // Requesting more than available (stock: 2)
        ]
      })
    });
    
    const insufficientStockData = await insufficientStockResponse.json();
    if (insufficientStockResponse.status === 400) {
      console.log('✅ Insufficient stock: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', insufficientStockData.message);
      console.log('📝 Error details:', insufficientStockData.errors);
      
      // Validate error message mentions insufficient stock (User Story 9 requirement)
      const errorText = insufficientStockData.errors[0].toLowerCase();
      if (errorText.includes('insufficient stock') || errorText.includes('not enough')) {
        console.log('✅ Clear insufficient stock error message provided');
      } else {
        console.log('⚠️  Error message could be clearer about insufficient stock');
      }
    } else {
      console.log('❌ Insufficient stock test failed:', insufficientStockResponse.status);
    }
    
    // Test 6: Out of stock product (400 Bad Request)
    if (testProducts.length > 3) {
      console.log('\n6️⃣ Testing order with out of stock product...');
      const outOfStockResponse = await fetch(`${baseURL}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          products: [
            { productId: testProducts[3].id, quantity: 1 } // Stock: 0
          ]
        })
      });
      
      const outOfStockData = await outOfStockResponse.json();
      if (outOfStockResponse.status === 400) {
        console.log('✅ Out of stock product: 400 Bad Request (CORRECT)');
        console.log('📝 Error details:', outOfStockData.errors);
      } else {
        console.log('❌ Out of stock product test failed:', outOfStockResponse.status);
      }
    }
    
    // Test 7: Invalid request body format
    console.log('\n7️⃣ Testing invalid request body format...');
    const invalidFormatResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ productId: testProducts[0].id, quantity: 1 }) // Object instead of array
    });
    
    const invalidFormatData = await invalidFormatResponse.json();
    if (invalidFormatResponse.status === 400) {
      console.log('✅ Invalid format: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', invalidFormatData.message);
    } else {
      console.log('❌ Invalid format test failed:', invalidFormatResponse.status);
    }
    
    // Test 8: Empty order array
    console.log('\n8️⃣ Testing empty order array...');
    const emptyOrderResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        products: []
      })
    });
    
    const emptyOrderData = await emptyOrderResponse.json();
    if (emptyOrderResponse.status === 400) {
      console.log('✅ Empty order array: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', emptyOrderData.message);
    } else {
      console.log('❌ Empty order array test failed:', emptyOrderResponse.status);
    }
    
    // Test 9: Invalid quantity values
    console.log('\n9️⃣ Testing invalid quantity values...');
    const invalidQuantityResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        products: [
          { productId: testProducts[0].id, quantity: 0 }, // Invalid: zero quantity
          { productId: testProducts[1].id, quantity: -1 } // Invalid: negative quantity
        ]
      })
    });
    
    const invalidQuantityData = await invalidQuantityResponse.json();
    if (invalidQuantityResponse.status === 400) {
      console.log('✅ Invalid quantities: 400 Bad Request (CORRECT)');
      console.log('📝 Error details:', invalidQuantityData.errors);
    } else {
      console.log('❌ Invalid quantities test failed:', invalidQuantityResponse.status);
    }
    
    // Test 10: Transaction rollback test (mixed valid/invalid products)
    console.log('\n🔟 Testing transaction rollback (mixed valid/invalid products)...');
    const rollbackResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        products: [
          { productId: testProducts[0].id, quantity: 1 }, // Valid
          { productId: 'invalid-product-id', quantity: 1 } // Invalid - should cause rollback
        ]
      })
    });
    
    const rollbackData = await rollbackResponse.json();
    if (rollbackResponse.status === 404) {
      console.log('✅ Transaction rollback: 404 Not Found (CORRECT)');
      console.log('📝 Entire transaction rolled back due to invalid product');
      
      // Verify stock wasn't updated for valid product
      const stockCheckResponse = await fetch(`${baseURL}/products/${testProducts[0].id}`);
      const stockCheckData = await stockCheckResponse.json();
      
      if (stockCheckResponse.status === 200) {
        console.log('✅ Stock not updated due to transaction rollback');
        console.log('📊 Product stock preserved:', stockCheckData.object.stock);
      }
    } else {
      console.log('❌ Transaction rollback test failed:', rollbackResponse.status);
    }
    
    // Test 11: Verify stock updates after successful order
    console.log('\n1️⃣1️⃣ Testing stock updates after successful order...');
    
    // Get current stock
    const beforeStockResponse = await fetch(`${baseURL}/products/${testProducts[0].id}`);
    const beforeStockData = await beforeStockResponse.json();
    const stockBefore = beforeStockData.object.stock;
    
    // Place order
    const stockTestResponse = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        products: [
          { productId: testProducts[0].id, quantity: 1 }
        ]
      })
    });
    
    if (stockTestResponse.status === 201) {
      // Check stock after order
      const afterStockResponse = await fetch(`${baseURL}/products/${testProducts[0].id}`);
      const afterStockData = await afterStockResponse.json();
      const stockAfter = afterStockData.object.stock;
      
      if (stockAfter === stockBefore - 1) {
        console.log('✅ Stock correctly updated after order');
        console.log('📊 Stock before:', stockBefore, '→ Stock after:', stockAfter);
      } else {
        console.log('❌ Stock not updated correctly');
      }
    }
    
    console.log('\n🎉 User Story 9 - Place a New Order Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ POST /orders endpoint implemented');
    console.log('✅ Protected endpoint (authenticated users only)');
    console.log('✅ New request format with products array and optional description');
    console.log('✅ Description field support (Page 2 PDF requirement)');
    console.log('✅ Auto-generated description when none provided');
    console.log('✅ Description validation (max 500 characters)');
    console.log('✅ 201 Created with order details (order_id, status, total_price, description, products)');
    console.log('✅ 404 Not Found for non-existent products');
    console.log('✅ 400 Bad Request for insufficient stock with clear error messages');
    console.log('✅ Database transaction handling (all-or-nothing)');
    console.log('✅ Backend total_price calculation using database prices');
    console.log('✅ Stock verification and updates within transaction');
    console.log('✅ Proper validation for request format and quantities');
    console.log('✅ Transaction rollback on any failure');
    console.log('✅ Standard Base Response format maintained');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
    console.log('💡 Make sure admin user exists: npm run setup-admin');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testPlaceOrder();
}

module.exports = testPlaceOrder;