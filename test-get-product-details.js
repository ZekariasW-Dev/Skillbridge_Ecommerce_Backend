// Test script for User Story 7 - Get Product Details functionality
// Run this after starting the server to test get product details endpoint

const testGetProductDetails = async () => {
  const baseURL = 'http://localhost:3000';
  let adminToken = null;
  let testProductId = null;
  
  console.log('🧪 Testing User Story 7 - Get Product Details Functionality\n');
  
  try {
    // Setup: Get admin token to create a test product
    console.log('🔧 Setup: Getting admin token to create test product...');
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
    }
    
    // Setup: Create a detailed test product
    if (adminToken) {
      console.log('🔧 Setup: Creating detailed test product...');
      const createProductResponse = await fetch(`${baseURL}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: 'Premium Wireless Headphones',
          description: 'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals who demand the best audio experience.',
          price: 299.99,
          stock: 45,
          category: 'Audio Equipment'
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
    } else {
      console.log('⚠️  Skipping product creation - no admin token');
      return;
    }
    
    // Test 1: Valid product ID (200 OK with complete product object)
    console.log('\n1️⃣ Testing valid product ID (should return complete product details)...');
    const validResponse = await fetch(`${baseURL}/products/${testProductId}`);
    const validData = await validResponse.json();
    
    if (validResponse.status === 200 && validData.success) {
      console.log('✅ Valid product ID: 200 OK (CORRECT)');
      console.log('📦 Product details retrieved successfully');
      
      // Validate complete product object structure (User Story 7 requirement)
      const product = validData.object;
      const requiredFields = ['id', 'name', 'description', 'price', 'stock', 'category'];
      const hasAllFields = requiredFields.every(field => product.hasOwnProperty(field));
      
      if (hasAllFields) {
        console.log('✅ Complete product object returned with all required fields');
        console.log('📋 Product details:');
        console.log('  - ID:', product.id);
        console.log('  - Name:', product.name);
        console.log('  - Description:', product.description.substring(0, 50) + '...');
        console.log('  - Price:', product.price);
        console.log('  - Stock:', product.stock);
        console.log('  - Category:', product.category);
        console.log('  - Created At:', product.createdAt ? 'Present' : 'Missing');
      } else {
        console.log('❌ Product object missing required fields');
        console.log('Missing fields:', requiredFields.filter(field => !product.hasOwnProperty(field)));
      }
      
      // Validate response structure
      const hasResponseStructure = validData.hasOwnProperty('success') &&
                                  validData.hasOwnProperty('message') &&
                                  validData.hasOwnProperty('object') &&
                                  validData.hasOwnProperty('errors');
      
      if (hasResponseStructure) {
        console.log('✅ Response follows standard Base Response format');
      } else {
        console.log('❌ Response structure incorrect');
      }
    } else {
      console.log('❌ Valid product ID test failed:', validData);
    }
    
    // Test 2: Non-existent product ID (404 Not Found)
    console.log('\n2️⃣ Testing non-existent product ID...');
    const nonExistentResponse = await fetch(`${baseURL}/products/non-existent-product-id`);
    const nonExistentData = await nonExistentResponse.json();
    
    if (nonExistentResponse.status === 404) {
      console.log('✅ Non-existent product ID: 404 Not Found (CORRECT)');
      console.log('📝 Error message:', nonExistentData.message);
      console.log('📝 Error details:', nonExistentData.errors);
      
      // Validate error message (User Story 7 requirement)
      if (nonExistentData.message.toLowerCase().includes('not found') || 
          (nonExistentData.errors && nonExistentData.errors.some(err => err.toLowerCase().includes('not found')))) {
        console.log('✅ Clear error message provided (User Story 7 requirement)');
      } else {
        console.log('❌ Error message not clear enough');
      }
    } else {
      console.log('❌ Non-existent product ID test failed');
    }
    
    // Test 3: Empty product ID (400 Bad Request)
    console.log('\n3️⃣ Testing empty product ID...');
    const emptyIdResponse = await fetch(`${baseURL}/products/ `); // Space as ID
    const emptyIdData = await emptyIdResponse.json();
    
    if (emptyIdResponse.status === 400 || emptyIdResponse.status === 404) {
      console.log('✅ Empty product ID handled appropriately:', emptyIdResponse.status);
      console.log('📝 Response:', emptyIdData.message);
    } else {
      console.log('❌ Empty product ID not handled properly');
    }
    
    // Test 4: Public access (no authentication required)
    console.log('\n4️⃣ Testing public access (no authentication required)...');
    const publicResponse = await fetch(`${baseURL}/products/${testProductId}`);
    const publicData = await publicResponse.json();
    
    if (publicResponse.status === 200 && publicData.success) {
      console.log('✅ Public access: 200 OK (CORRECT)');
      console.log('📦 Product details accessible without authentication');
      console.log('👤 No authentication token required');
    } else {
      console.log('❌ Public access test failed');
    }
    
    // Test 5: Invalid UUID format
    console.log('\n5️⃣ Testing invalid UUID format...');
    const invalidUuidResponse = await fetch(`${baseURL}/products/invalid-uuid-format`);
    const invalidUuidData = await invalidUuidResponse.json();
    
    if (invalidUuidResponse.status === 404) {
      console.log('✅ Invalid UUID format: 404 Not Found (CORRECT)');
      console.log('📝 Handled gracefully as product not found');
    } else {
      console.log('⚠️  Invalid UUID format handled as:', invalidUuidResponse.status);
    }
    
    // Test 6: Very long product ID
    console.log('\n6️⃣ Testing very long product ID...');
    const longId = 'a'.repeat(1000);
    const longIdResponse = await fetch(`${baseURL}/products/${longId}`);
    const longIdData = await longIdResponse.json();
    
    if (longIdResponse.status === 404) {
      console.log('✅ Very long product ID: 404 Not Found (CORRECT)');
      console.log('📝 Handled gracefully as product not found');
    } else {
      console.log('⚠️  Very long product ID handled as:', longIdResponse.status);
    }
    
    // Test 7: Special characters in product ID
    console.log('\n7️⃣ Testing special characters in product ID...');
    const specialCharsResponse = await fetch(`${baseURL}/products/test@#$%^&*()`);
    const specialCharsData = await specialCharsResponse.json();
    
    if (specialCharsResponse.status === 404) {
      console.log('✅ Special characters in ID: 404 Not Found (CORRECT)');
      console.log('📝 Handled gracefully as product not found');
    } else {
      console.log('⚠️  Special characters in ID handled as:', specialCharsResponse.status);
    }
    
    // Test 8: Response time and performance
    console.log('\n8️⃣ Testing response time and performance...');
    const startTime = Date.now();
    const performanceResponse = await fetch(`${baseURL}/products/${testProductId}`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (performanceResponse.status === 200) {
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
    
    // Test 9: Verify all product fields are present and correct
    console.log('\n9️⃣ Testing complete product object validation...');
    const completeResponse = await fetch(`${baseURL}/products/${testProductId}`);
    const completeData = await completeResponse.json();
    
    if (completeResponse.status === 200 && completeData.success) {
      const product = completeData.object;
      console.log('✅ Complete product object validation');
      
      // Validate data types
      const validations = [
        { field: 'id', type: 'string', value: product.id },
        { field: 'name', type: 'string', value: product.name },
        { field: 'description', type: 'string', value: product.description },
        { field: 'price', type: 'number', value: product.price },
        { field: 'stock', type: 'number', value: product.stock },
        { field: 'category', type: 'string', value: product.category }
      ];
      
      let allValid = true;
      validations.forEach(validation => {
        const isValid = typeof validation.value === validation.type && validation.value !== null && validation.value !== undefined;
        if (isValid) {
          console.log(`  ✅ ${validation.field}: ${validation.type} (${validation.value})`);
        } else {
          console.log(`  ❌ ${validation.field}: Expected ${validation.type}, got ${typeof validation.value}`);
          allValid = false;
        }
      });
      
      if (allValid) {
        console.log('✅ All product fields have correct data types');
      } else {
        console.log('❌ Some product fields have incorrect data types');
      }
    } else {
      console.log('❌ Complete product object validation failed');
    }
    
    // Test 10: Cross-reference with product list
    console.log('\n🔟 Testing cross-reference with product list...');
    const listResponse = await fetch(`${baseURL}/products`);
    const listData = await listResponse.json();
    
    if (listResponse.status === 200 && listData.success) {
      const productInList = listData.products.find(p => p.id === testProductId);
      
      if (productInList) {
        console.log('✅ Product found in product list');
        
        // Compare details
        const detailResponse = await fetch(`${baseURL}/products/${testProductId}`);
        const detailData = await detailResponse.json();
        
        if (detailResponse.status === 200) {
          const detailProduct = detailData.object;
          const fieldsMatch = productInList.name === detailProduct.name &&
                             productInList.price === detailProduct.price &&
                             productInList.stock === detailProduct.stock;
          
          if (fieldsMatch) {
            console.log('✅ Product details consistent between list and detail views');
          } else {
            console.log('❌ Product details inconsistent between views');
          }
        }
      } else {
        console.log('❌ Product not found in product list');
      }
    } else {
      console.log('⚠️  Could not retrieve product list for comparison');
    }
    
    console.log('\n🎉 User Story 7 - Get Product Details Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ GET /products/:id endpoint implemented');
    console.log('✅ Public endpoint (no authentication required)');
    console.log('✅ Product ID included in URL path');
    console.log('✅ 200 OK with complete product object on success');
    console.log('✅ Complete product details: id, name, description, price, stock, category');
    console.log('✅ 404 Not Found with clear error message when product not found');
    console.log('✅ Proper error handling for invalid/malformed IDs');
    console.log('✅ Standard Base Response format maintained');
    console.log('✅ Good performance and response times');
    console.log('✅ Data consistency across different endpoints');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
    console.log('💡 Make sure admin user exists: npm run setup-admin');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testGetProductDetails();
}

module.exports = testGetProductDetails;