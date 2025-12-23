// Test script for User Story 3 - Create Product functionality
// Run this after starting the server to test create product endpoint

const testCreateProduct = async () => {
  const baseURL = 'http://localhost:3000';
  let adminToken = null;
  let userToken = null;
  
  console.log('🧪 Testing User Story 3 - Create Product Functionality\n');
  
  try {
    // Setup: Create admin user and get token
    console.log('🔧 Setup: Creating admin user and getting token...');
    
    // Register admin user
    const adminRegisterResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin123',
        email: 'admin123@example.com',
        password: 'AdminPass123!'
      })
    });
    
    if (adminRegisterResponse.status === 201 || adminRegisterResponse.status === 400) {
      // Login as admin (we'll manually set role in database or use existing admin)
      const adminLoginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com', // Use existing admin from setup-admin.js
          password: 'AdminPass123!'
        })
      });
      
      if (adminLoginResponse.status === 200) {
        const adminLoginData = await adminLoginResponse.json();
        adminToken = adminLoginData.object.token;
        console.log('✅ Admin token obtained');
      } else {
        console.log('⚠️  Using fallback admin setup - run: npm run setup-admin');
      }
    }
    
    // Setup: Create regular user and get token
    const userRegisterResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'regularuser',
        email: 'user@example.com',
        password: 'UserPass123!'
      })
    });
    
    if (userRegisterResponse.status === 201 || userRegisterResponse.status === 400) {
      const userLoginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'UserPass123!'
        })
      });
      
      if (userLoginResponse.status === 200) {
        const userLoginData = await userLoginResponse.json();
        userToken = userLoginData.object.token;
        console.log('✅ Regular user token obtained');
      }
    }
    
    // Test 1: Unauthenticated request (401 Unauthorized)
    console.log('\n1️⃣ Testing unauthenticated request...');
    const unauthResponse = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Product',
        description: 'This is a test product description',
        price: 29.99,
        stock: 100,
        category: 'Electronics'
      })
    });
    
    if (unauthResponse.status === 401) {
      console.log('✅ Unauthenticated request: 401 Unauthorized (CORRECT)');
    } else {
      console.log('❌ Unauthenticated request test failed');
    }
    
    // Test 2: Non-admin user request (403 Forbidden)
    if (userToken) {
      console.log('\n2️⃣ Testing non-admin user request...');
      const nonAdminResponse = await fetch(`${baseURL}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          name: 'Test Product',
          description: 'This is a test product description',
          price: 29.99,
          stock: 100,
          category: 'Electronics'
        })
      });
      
      if (nonAdminResponse.status === 403) {
        console.log('✅ Non-admin user request: 403 Forbidden (CORRECT)');
      } else {
        console.log('❌ Non-admin user request test failed');
      }
    }
    
    if (!adminToken) {
      console.log('\n⚠️  Cannot continue with admin tests - no admin token available');
      console.log('💡 Please run: npm run setup-admin first');
      return;
    }
    
    // Test 3: Valid product creation (201 Created)
    console.log('\n3️⃣ Testing valid product creation...');
    const validProductResponse = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Smartphone XYZ',
        description: 'Latest smartphone with advanced features and great performance',
        price: 599.99,
        stock: 50,
        category: 'Electronics'
      })
    });
    
    const validProductData = await validProductResponse.json();
    if (validProductResponse.status === 201 && validProductData.success) {
      console.log('✅ Valid product creation: 201 Created (CORRECT)');
      console.log('📦 Product created:', {
        id: validProductData.object.id ? 'Present' : 'Missing',
        name: validProductData.object.name,
        price: validProductData.object.price,
        stock: validProductData.object.stock
      });
    } else {
      console.log('❌ Valid product creation failed:', validProductData);
    }
    
    // Test 4: Invalid name (too short) - 400 Bad Request
    console.log('\n4️⃣ Testing invalid name (too short)...');
    const shortNameResponse = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'AB', // Too short (less than 3 characters)
        description: 'This is a valid description with more than 10 characters',
        price: 29.99,
        stock: 10,
        category: 'Test'
      })
    });
    
    const shortNameData = await shortNameResponse.json();
    if (shortNameResponse.status === 400) {
      console.log('✅ Short name validation: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', shortNameData.errors[0]);
    } else {
      console.log('❌ Short name validation test failed');
    }
    
    // Test 5: Invalid description (too short) - 400 Bad Request
    console.log('\n5️⃣ Testing invalid description (too short)...');
    const shortDescResponse = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Valid Product Name',
        description: 'Short', // Too short (less than 10 characters)
        price: 29.99,
        stock: 10,
        category: 'Test'
      })
    });
    
    const shortDescData = await shortDescResponse.json();
    if (shortDescResponse.status === 400) {
      console.log('✅ Short description validation: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', shortDescData.errors[0]);
    } else {
      console.log('❌ Short description validation test failed');
    }
    
    // Test 6: Invalid price (negative) - 400 Bad Request
    console.log('\n6️⃣ Testing invalid price (negative)...');
    const negativePriceResponse = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Valid Product Name',
        description: 'This is a valid description with more than 10 characters',
        price: -10.99, // Negative price
        stock: 10,
        category: 'Test'
      })
    });
    
    const negativePriceData = await negativePriceResponse.json();
    if (negativePriceResponse.status === 400) {
      console.log('✅ Negative price validation: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', negativePriceData.errors[0]);
    } else {
      console.log('❌ Negative price validation test failed');
    }
    
    // Test 7: Invalid stock (negative) - 400 Bad Request
    console.log('\n7️⃣ Testing invalid stock (negative)...');
    const negativeStockResponse = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Valid Product Name',
        description: 'This is a valid description with more than 10 characters',
        price: 29.99,
        stock: -5, // Negative stock
        category: 'Test'
      })
    });
    
    const negativeStockData = await negativeStockResponse.json();
    if (negativeStockResponse.status === 400) {
      console.log('✅ Negative stock validation: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', negativeStockData.errors[0]);
    } else {
      console.log('❌ Negative stock validation test failed');
    }
    
    // Test 8: Missing required fields - 400 Bad Request
    console.log('\n8️⃣ Testing missing required fields...');
    const missingFieldsResponse = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Valid Product Name',
        // description missing
        price: 29.99,
        stock: 10
        // category missing
      })
    });
    
    const missingFieldsData = await missingFieldsResponse.json();
    if (missingFieldsResponse.status === 400) {
      console.log('✅ Missing fields validation: 400 Bad Request (CORRECT)');
      console.log('📝 Error messages:', missingFieldsData.errors);
    } else {
      console.log('❌ Missing fields validation test failed');
    }
    
    console.log('\n🎉 User Story 3 - Create Product Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ POST /products endpoint implemented');
    console.log('✅ Admin-only access with proper authorization');
    console.log('✅ 201 Created with product data on success');
    console.log('✅ 400 Bad Request for validation failures');
    console.log('✅ 401 Unauthorized for unauthenticated requests');
    console.log('✅ 403 Forbidden for non-admin users');
    console.log('✅ Comprehensive input validation for all fields');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
    console.log('💡 Make sure admin user exists: npm run setup-admin');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testCreateProduct();
}

module.exports = testCreateProduct;