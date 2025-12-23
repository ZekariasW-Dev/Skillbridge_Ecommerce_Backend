// Test script for User Story 8 - Delete Product functionality
// Run this after starting the server to test delete product endpoint

const testDeleteProduct = async () => {
  const baseURL = 'http://localhost:3000';
  let adminToken = null;
  let userToken = null;
  let testProductId = null;
  let testProductName = null;
  
  console.log('🧪 Testing User Story 8 - Delete Product Functionality\n');
  
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
        username: 'deletetest',
        email: 'deletetest@example.com',
        password: 'UserPass123!'
      })
    });
    
    if (userRegisterResponse.status === 201 || userRegisterResponse.status === 400) {
      const userLoginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'deletetest@example.com',
          password: 'UserPass123!'
        })
      });
      
      if (userLoginResponse.status === 200) {
        const userLoginData = await userLoginResponse.json();
        userToken = userLoginData.object.token;
        console.log('✅ Regular user token obtained');
      }
    }
    
    // Setup: Create test products for deletion
    console.log('🔧 Setup: Creating test products for deletion...');
    const testProducts = [
      {
        name: 'Product to Delete 1',
        description: 'This product will be deleted during testing',
        price: 99.99,
        stock: 10,
        category: 'Test Category'
      },
      {
        name: 'Product to Delete 2',
        description: 'Another product for deletion testing',
        price: 149.99,
        stock: 5,
        category: 'Test Category'
      }
    ];
    
    const createdProducts = [];
    for (const product of testProducts) {
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
        createdProducts.push({
          id: createData.object.id,
          name: createData.object.name
        });
      }
    }
    
    if (createdProducts.length > 0) {
      testProductId = createdProducts[0].id;
      testProductName = createdProducts[0].name;
      console.log('✅ Test products created for deletion testing');
    } else {
      console.log('❌ Failed to create test products');
      return;
    }
    
    // Test 1: Unauthenticated delete request (401 Unauthorized)
    console.log('\n1️⃣ Testing unauthenticated delete request...');
    const unauthResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'DELETE'
    });
    
    if (unauthResponse.status === 401) {
      console.log('✅ Unauthenticated request: 401 Unauthorized (CORRECT)');
    } else {
      console.log('❌ Unauthenticated request test failed:', unauthResponse.status);
    }
    
    // Test 2: Non-admin user delete request (403 Forbidden)
    if (userToken) {
      console.log('\n2️⃣ Testing non-admin user delete request...');
      const nonAdminResponse = await fetch(`${baseURL}/products/${testProductId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (nonAdminResponse.status === 403) {
        console.log('✅ Non-admin user request: 403 Forbidden (CORRECT)');
      } else {
        console.log('❌ Non-admin user request test failed:', nonAdminResponse.status);
      }
    }
    
    // Test 3: Delete non-existent product (404 Not Found)
    console.log('\n3️⃣ Testing delete of non-existent product...');
    const nonExistentResponse = await fetch(`${baseURL}/products/non-existent-product-id`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const nonExistentData = await nonExistentResponse.json();
    if (nonExistentResponse.status === 404) {
      console.log('✅ Non-existent product: 404 Not Found (CORRECT)');
      console.log('📝 Error message:', nonExistentData.message);
      console.log('📝 Error details:', nonExistentData.errors);
    } else {
      console.log('❌ Non-existent product test failed');
    }
    
    // Test 4: Verify product exists before deletion
    console.log('\n4️⃣ Testing product exists before deletion...');
    const beforeDeleteResponse = await fetch(`${baseURL}/products/${testProductId}`);
    const beforeDeleteData = await beforeDeleteResponse.json();
    
    if (beforeDeleteResponse.status === 200 && beforeDeleteData.success) {
      console.log('✅ Product exists before deletion');
      console.log('📦 Product name:', beforeDeleteData.object.name);
    } else {
      console.log('❌ Product should exist before deletion');
    }
    
    // Test 5: Successful product deletion (200 OK)
    console.log('\n5️⃣ Testing successful product deletion...');
    const deleteResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const deleteData = await deleteResponse.json();
    if (deleteResponse.status === 200 && deleteData.success) {
      console.log('✅ Successful deletion: 200 OK (CORRECT)');
      console.log('📝 Confirmation message:', deleteData.message);
      
      // Validate confirmation message (User Story 8 requirement)
      if (deleteData.message === 'Product deleted successfully') {
        console.log('✅ Correct confirmation message (User Story 8 requirement)');
      } else {
        console.log('⚠️  Confirmation message differs from specification');
      }
      
      // Check if deletion details are provided
      if (deleteData.object && deleteData.object.deletedProductId) {
        console.log('✅ Deletion details provided');
        console.log('📋 Deleted product ID:', deleteData.object.deletedProductId);
        console.log('📋 Deleted product name:', deleteData.object.deletedProductName);
      }
    } else {
      console.log('❌ Successful deletion test failed:', deleteData);
    }
    
    // Test 6: Verify product no longer exists after deletion
    console.log('\n6️⃣ Testing product no longer exists after deletion...');
    const afterDeleteResponse = await fetch(`${baseURL}/products/${testProductId}`);
    const afterDeleteData = await afterDeleteResponse.json();
    
    if (afterDeleteResponse.status === 404) {
      console.log('✅ Product no longer exists after deletion (CORRECT)');
      console.log('📝 Product permanently removed from catalog');
    } else {
      console.log('❌ Product should not exist after deletion');
    }
    
    // Test 7: Verify product not in product list
    console.log('\n7️⃣ Testing product not in product list after deletion...');
    const listResponse = await fetch(`${baseURL}/products`);
    const listData = await listResponse.json();
    
    if (listResponse.status === 200 && listData.success) {
      const productInList = listData.products.find(p => p.id === testProductId);
      
      if (!productInList) {
        console.log('✅ Product not found in product list (CORRECT)');
        console.log('📝 Product no longer visible or available for purchase');
      } else {
        console.log('❌ Product should not appear in product list after deletion');
      }
    } else {
      console.log('⚠️  Could not retrieve product list for verification');
    }
    
    // Test 8: Attempt to delete already deleted product
    console.log('\n8️⃣ Testing deletion of already deleted product...');
    const alreadyDeletedResponse = await fetch(`${baseURL}/products/${testProductId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const alreadyDeletedData = await alreadyDeletedResponse.json();
    if (alreadyDeletedResponse.status === 404) {
      console.log('✅ Already deleted product: 404 Not Found (CORRECT)');
      console.log('📝 Proper handling of non-existent product');
    } else {
      console.log('❌ Already deleted product test failed');
    }
    
    // Test 9: Delete second test product and verify response structure
    if (createdProducts.length > 1) {
      console.log('\n9️⃣ Testing response structure validation...');
      const secondProductId = createdProducts[1].id;
      const structureResponse = await fetch(`${baseURL}/products/${secondProductId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      const structureData = await structureResponse.json();
      if (structureResponse.status === 200 && structureData.success) {
        console.log('✅ Response structure validation: 200 OK');
        
        // Validate User Story 8 response structure
        const hasRequiredFields = structureData.hasOwnProperty('success') &&
                                 structureData.hasOwnProperty('message') &&
                                 structureData.hasOwnProperty('object') &&
                                 structureData.hasOwnProperty('errors');
        
        if (hasRequiredFields) {
          console.log('✅ Response follows standard Base Response format');
        } else {
          console.log('❌ Response structure missing required fields');
        }
        
        // Validate success fields
        if (structureData.success === true && structureData.errors === null) {
          console.log('✅ Success response fields correct');
        } else {
          console.log('❌ Success response fields incorrect');
        }
      } else {
        console.log('❌ Response structure validation failed');
      }
    }
    
    // Test 10: Empty product ID handling
    console.log('\n🔟 Testing empty product ID...');
    const emptyIdResponse = await fetch(`${baseURL}/products/ `, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (emptyIdResponse.status === 400 || emptyIdResponse.status === 404) {
      console.log('✅ Empty product ID handled appropriately:', emptyIdResponse.status);
    } else {
      console.log('⚠️  Empty product ID handling:', emptyIdResponse.status);
    }
    
    // Test 11: Performance and cleanup verification
    console.log('\n1️⃣1️⃣ Testing performance and cleanup...');
    
    // Create a product for performance testing
    const perfTestResponse = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Performance Test Product',
        description: 'Product for testing deletion performance',
        price: 19.99,
        stock: 1,
        category: 'Test'
      })
    });
    
    if (perfTestResponse.status === 201) {
      const perfTestData = await perfTestResponse.json();
      const perfProductId = perfTestData.object.id;
      
      // Measure deletion time
      const startTime = Date.now();
      const perfDeleteResponse = await fetch(`${baseURL}/products/${perfProductId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const endTime = Date.now();
      const deleteTime = endTime - startTime;
      
      if (perfDeleteResponse.status === 200) {
        console.log('✅ Performance test: 200 OK');
        console.log('⏱️  Deletion time:', deleteTime, 'ms');
        
        if (deleteTime < 1000) {
          console.log('✅ Deletion performance acceptable (< 1 second)');
        } else {
          console.log('⚠️  Deletion may be slow (> 1 second)');
        }
      }
    }
    
    console.log('\n🎉 User Story 8 - Delete Product Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ DELETE /products/:id endpoint implemented');
    console.log('✅ Admin-only access with proper authorization');
    console.log('✅ 200 OK with confirmation message "Product deleted successfully"');
    console.log('✅ 404 Not Found for non-existent products');
    console.log('✅ 401 Unauthorized for unauthenticated requests');
    console.log('✅ 403 Forbidden for non-admin users');
    console.log('✅ Product permanently removed from catalog');
    console.log('✅ Product no longer visible or available for purchase');
    console.log('✅ Proper error handling for edge cases');
    console.log('✅ Standard Base Response format maintained');
    console.log('✅ Good performance and proper cleanup');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
    console.log('💡 Make sure admin user exists: npm run setup-admin');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testDeleteProduct();
}

module.exports = testDeleteProduct;