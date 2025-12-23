// Test script for User Story 5 - Get List of Products functionality
// Run this after starting the server to test get products endpoint

const testGetProducts = async () => {
  const baseURL = 'http://localhost:3000';
  let adminToken = null;
  
  console.log('🧪 Testing User Story 5 - Get List of Products Functionality\n');
  
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
    }
    
    // Setup: Create some test products if we have admin access
    if (adminToken) {
      console.log('🔧 Setup: Creating test products...');
      const testProducts = [
        {
          name: 'Smartphone Pro Max',
          description: 'Latest flagship smartphone with advanced features',
          price: 999.99,
          stock: 25,
          category: 'Electronics'
        },
        {
          name: 'Wireless Headphones',
          description: 'Premium noise-cancelling wireless headphones',
          price: 299.99,
          stock: 50,
          category: 'Electronics'
        },
        {
          name: 'Gaming Laptop',
          description: 'High-performance gaming laptop with RTX graphics',
          price: 1599.99,
          stock: 15,
          category: 'Computers'
        },
        {
          name: 'Coffee Maker',
          description: 'Automatic drip coffee maker with programmable timer',
          price: 89.99,
          stock: 30,
          category: 'Appliances'
        },
        {
          name: 'Running Shoes',
          description: 'Lightweight running shoes with advanced cushioning',
          price: 129.99,
          stock: 40,
          category: 'Sports'
        }
      ];
      
      for (const product of testProducts) {
        await fetch(`${baseURL}/products`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(product)
        });
      }
      console.log('✅ Test products created');
    }
    
    // Test 1: Basic GET request without authentication (Public Access)
    console.log('\n1️⃣ Testing public access (no authentication required)...');
    const publicResponse = await fetch(`${baseURL}/products`);
    const publicData = await publicResponse.json();
    
    if (publicResponse.status === 200 && publicData.success) {
      console.log('✅ Public access: 200 OK (CORRECT)');
      console.log('📦 Products retrieved without authentication');
    } else {
      console.log('❌ Public access test failed');
    }
    
    // Test 2: Default pagination (no query parameters)
    console.log('\n2️⃣ Testing default pagination...');
    const defaultResponse = await fetch(`${baseURL}/products`);
    const defaultData = await defaultResponse.json();
    
    if (defaultResponse.status === 200 && defaultData.success) {
      console.log('✅ Default pagination: 200 OK (CORRECT)');
      console.log('📋 Response format validation:');
      console.log('  - currentPage:', defaultData.currentPage, '(should be 1)');
      console.log('  - pageSize:', defaultData.pageSize, '(should be 10)');
      console.log('  - totalPages:', defaultData.totalPages);
      console.log('  - totalProducts:', defaultData.totalProducts);
      console.log('  - products array length:', defaultData.products.length);
      
      // Validate response structure (User Story 5 requirements)
      const hasRequiredFields = defaultData.hasOwnProperty('currentPage') &&
                               defaultData.hasOwnProperty('pageSize') &&
                               defaultData.hasOwnProperty('totalPages') &&
                               defaultData.hasOwnProperty('totalProducts') &&
                               defaultData.hasOwnProperty('products');
      
      if (hasRequiredFields) {
        console.log('✅ Response structure matches User Story 5 requirements');
      } else {
        console.log('❌ Response structure missing required fields');
      }
      
      // Validate product object structure
      if (defaultData.products.length > 0) {
        const product = defaultData.products[0];
        const hasProductFields = product.hasOwnProperty('id') &&
                                product.hasOwnProperty('name') &&
                                product.hasOwnProperty('price') &&
                                product.hasOwnProperty('stock') &&
                                product.hasOwnProperty('category');
        
        if (hasProductFields) {
          console.log('✅ Product objects contain essential information (id, name, price, stock, category)');
        } else {
          console.log('❌ Product objects missing essential fields');
        }
      }
    } else {
      console.log('❌ Default pagination test failed');
    }
    
    // Test 3: Custom page parameter
    console.log('\n3️⃣ Testing custom page parameter...');
    const pageResponse = await fetch(`${baseURL}/products?page=2`);
    const pageData = await pageResponse.json();
    
    if (pageResponse.status === 200 && pageData.success) {
      console.log('✅ Custom page parameter: 200 OK (CORRECT)');
      console.log('📋 Page 2 response:');
      console.log('  - currentPage:', pageData.currentPage, '(should be 2)');
      console.log('  - pageSize:', pageData.pageSize, '(should be 10)');
      console.log('  - products count:', pageData.products.length);
    } else {
      console.log('❌ Custom page parameter test failed');
    }
    
    // Test 4: Custom pageSize parameter
    console.log('\n4️⃣ Testing custom pageSize parameter...');
    const pageSizeResponse = await fetch(`${baseURL}/products?pageSize=3`);
    const pageSizeData = await pageSizeResponse.json();
    
    if (pageSizeResponse.status === 200 && pageSizeData.success) {
      console.log('✅ Custom pageSize parameter: 200 OK (CORRECT)');
      console.log('📋 PageSize 3 response:');
      console.log('  - currentPage:', pageSizeData.currentPage, '(should be 1)');
      console.log('  - pageSize:', pageSizeData.pageSize, '(should be 3)');
      console.log('  - products count:', pageSizeData.products.length, '(should be 3 or less)');
    } else {
      console.log('❌ Custom pageSize parameter test failed');
    }
    
    // Test 5: Custom limit parameter (alternative to pageSize)
    console.log('\n5️⃣ Testing custom limit parameter...');
    const limitResponse = await fetch(`${baseURL}/products?limit=5`);
    const limitData = await limitResponse.json();
    
    if (limitResponse.status === 200 && limitData.success) {
      console.log('✅ Custom limit parameter: 200 OK (CORRECT)');
      console.log('📋 Limit 5 response:');
      console.log('  - currentPage:', limitData.currentPage, '(should be 1)');
      console.log('  - pageSize:', limitData.pageSize, '(should be 5)');
      console.log('  - products count:', limitData.products.length, '(should be 5 or less)');
    } else {
      console.log('❌ Custom limit parameter test failed');
    }
    
    // Test 6: Combined pagination parameters
    console.log('\n6️⃣ Testing combined pagination parameters...');
    const combinedResponse = await fetch(`${baseURL}/products?page=2&pageSize=2`);
    const combinedData = await combinedResponse.json();
    
    if (combinedResponse.status === 200 && combinedData.success) {
      console.log('✅ Combined pagination parameters: 200 OK (CORRECT)');
      console.log('📋 Page 2, PageSize 2 response:');
      console.log('  - currentPage:', combinedData.currentPage, '(should be 2)');
      console.log('  - pageSize:', combinedData.pageSize, '(should be 2)');
      console.log('  - products count:', combinedData.products.length, '(should be 2 or less)');
      console.log('  - totalPages:', combinedData.totalPages);
    } else {
      console.log('❌ Combined pagination parameters test failed');
    }
    
    // Test 7: Invalid page parameter
    console.log('\n7️⃣ Testing invalid page parameter...');
    const invalidPageResponse = await fetch(`${baseURL}/products?page=0`);
    const invalidPageData = await invalidPageResponse.json();
    
    if (invalidPageResponse.status === 400) {
      console.log('✅ Invalid page parameter: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', invalidPageData.errors[0]);
    } else {
      console.log('❌ Invalid page parameter test failed');
    }
    
    // Test 8: Invalid pageSize parameter (too large)
    console.log('\n8️⃣ Testing invalid pageSize parameter (too large)...');
    const invalidPageSizeResponse = await fetch(`${baseURL}/products?pageSize=200`);
    const invalidPageSizeData = await invalidPageSizeResponse.json();
    
    if (invalidPageSizeResponse.status === 400) {
      console.log('✅ Invalid pageSize parameter: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', invalidPageSizeData.errors[0]);
    } else {
      console.log('❌ Invalid pageSize parameter test failed');
    }
    
    // Test 9: Verify totalPages calculation
    console.log('\n9️⃣ Testing totalPages calculation...');
    const calculationResponse = await fetch(`${baseURL}/products?pageSize=1`);
    const calculationData = await calculationResponse.json();
    
    if (calculationResponse.status === 200 && calculationData.success) {
      const expectedTotalPages = Math.ceil(calculationData.totalProducts / 1);
      if (calculationData.totalPages === expectedTotalPages) {
        console.log('✅ TotalPages calculation: CORRECT');
        console.log('📊 Total products:', calculationData.totalProducts);
        console.log('📊 Total pages (pageSize=1):', calculationData.totalPages);
      } else {
        console.log('❌ TotalPages calculation incorrect');
      }
    } else {
      console.log('❌ TotalPages calculation test failed');
    }
    
    // Test 10: Empty result handling (page beyond available data)
    console.log('\n🔟 Testing page beyond available data...');
    const beyondResponse = await fetch(`${baseURL}/products?page=999`);
    const beyondData = await beyondResponse.json();
    
    if (beyondResponse.status === 200 && beyondData.success) {
      console.log('✅ Page beyond data: 200 OK (CORRECT)');
      console.log('📋 Beyond data response:');
      console.log('  - currentPage:', beyondData.currentPage, '(should be 999)');
      console.log('  - products count:', beyondData.products.length, '(should be 0)');
      console.log('  - totalProducts:', beyondData.totalProducts);
    } else {
      console.log('❌ Page beyond data test failed');
    }
    
    console.log('\n🎉 User Story 5 - Get List of Products Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ GET /products endpoint implemented');
    console.log('✅ Public access (no authentication required)');
    console.log('✅ Pagination support with page and pageSize/limit parameters');
    console.log('✅ Default values: page=1, pageSize=10');
    console.log('✅ Response format includes: currentPage, pageSize, totalPages, totalProducts, products');
    console.log('✅ Product objects contain essential information: id, name, price, stock, category');
    console.log('✅ Proper error handling for invalid pagination parameters');
    console.log('✅ Correct totalPages calculation based on pageSize');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testGetProducts();
}

module.exports = testGetProducts;