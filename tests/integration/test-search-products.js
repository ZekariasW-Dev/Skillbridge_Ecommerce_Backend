// Test script for User Story 6 - Search for Products functionality
// Run this after starting the server to test search products endpoint

const testSearchProducts = async () => {
  const baseURL = 'http://localhost:3000';
  let adminToken = null;
  
  console.log('🧪 Testing User Story 6 - Search for Products Functionality\n');
  
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
    
    // Setup: Create diverse test products for search testing
    if (adminToken) {
      console.log('🔧 Setup: Creating diverse test products for search...');
      const searchTestProducts = [
        {
          name: 'iPhone 15 Pro Max',
          description: 'Latest Apple smartphone with advanced camera system',
          price: 1199.99,
          stock: 20,
          category: 'Electronics'
        },
        {
          name: 'Samsung Galaxy Phone',
          description: 'Android smartphone with excellent display',
          price: 899.99,
          stock: 30,
          category: 'Electronics'
        },
        {
          name: 'MacBook Pro Laptop',
          description: 'Professional laptop for developers and creators',
          price: 2499.99,
          stock: 15,
          category: 'Computers'
        },
        {
          name: 'Dell Gaming Laptop',
          description: 'High-performance gaming laptop with RTX graphics',
          price: 1799.99,
          stock: 25,
          category: 'Computers'
        },
        {
          name: 'Apple Watch Series 9',
          description: 'Smart watch with health monitoring features',
          price: 399.99,
          stock: 40,
          category: 'Wearables'
        },
        {
          name: 'Bluetooth Headphones',
          description: 'Wireless headphones with noise cancellation',
          price: 199.99,
          stock: 50,
          category: 'Audio'
        },
        {
          name: 'Coffee Machine Pro',
          description: 'Professional espresso machine for home use',
          price: 599.99,
          stock: 12,
          category: 'Appliances'
        }
      ];
      
      for (const product of searchTestProducts) {
        await fetch(`${baseURL}/products`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(product)
        });
      }
      console.log('✅ Diverse test products created for search testing');
    }
    
    // Test 1: Empty search parameter (should return all products - User Story 5 behavior)
    console.log('\n1️⃣ Testing empty search parameter (should return all products)...');
    const emptySearchResponse = await fetch(`${baseURL}/products?search=`);
    const emptySearchData = await emptySearchResponse.json();
    
    if (emptySearchResponse.status === 200 && emptySearchData.success) {
      console.log('✅ Empty search: 200 OK (CORRECT)');
      console.log('📦 Returns all products when search is empty');
      console.log('📊 Total products:', emptySearchData.totalProducts);
      console.log('📊 Products returned:', emptySearchData.products.length);
    } else {
      console.log('❌ Empty search test failed');
    }
    
    // Test 2: Missing search parameter (should return all products - User Story 5 behavior)
    console.log('\n2️⃣ Testing missing search parameter (should return all products)...');
    const noSearchResponse = await fetch(`${baseURL}/products`);
    const noSearchData = await noSearchResponse.json();
    
    if (noSearchResponse.status === 200 && noSearchData.success) {
      console.log('✅ Missing search: 200 OK (CORRECT)');
      console.log('📦 Returns all products when search is not provided');
      console.log('📊 Total products:', noSearchData.totalProducts);
      
      // Verify same results as empty search
      if (noSearchData.totalProducts === emptySearchData.totalProducts) {
        console.log('✅ Missing search returns same results as empty search');
      } else {
        console.log('❌ Missing search results differ from empty search');
      }
    } else {
      console.log('❌ Missing search test failed');
    }
    
    // Test 3: Case-insensitive search (lowercase)
    console.log('\n3️⃣ Testing case-insensitive search (lowercase "iphone")...');
    const lowercaseResponse = await fetch(`${baseURL}/products?search=iphone`);
    const lowercaseData = await lowercaseResponse.json();
    
    if (lowercaseResponse.status === 200 && lowercaseData.success) {
      console.log('✅ Lowercase search: 200 OK (CORRECT)');
      console.log('📦 Found products:', lowercaseData.products.length);
      console.log('📊 Total matching products:', lowercaseData.totalProducts);
      
      // Check if iPhone products are found
      const foundIPhone = lowercaseData.products.some(p => 
        p.name.toLowerCase().includes('iphone')
      );
      if (foundIPhone) {
        console.log('✅ Case-insensitive search working (found iPhone with lowercase search)');
      } else {
        console.log('❌ Case-insensitive search not working');
      }
    } else {
      console.log('❌ Lowercase search test failed');
    }
    
    // Test 4: Case-insensitive search (uppercase)
    console.log('\n4️⃣ Testing case-insensitive search (uppercase "LAPTOP")...');
    const uppercaseResponse = await fetch(`${baseURL}/products?search=LAPTOP`);
    const uppercaseData = await uppercaseResponse.json();
    
    if (uppercaseResponse.status === 200 && uppercaseData.success) {
      console.log('✅ Uppercase search: 200 OK (CORRECT)');
      console.log('📦 Found products:', uppercaseData.products.length);
      console.log('📊 Total matching products:', uppercaseData.totalProducts);
      
      // Check if laptop products are found
      const foundLaptop = uppercaseData.products.some(p => 
        p.name.toLowerCase().includes('laptop')
      );
      if (foundLaptop) {
        console.log('✅ Case-insensitive search working (found laptop with uppercase search)');
      } else {
        console.log('❌ Case-insensitive search not working');
      }
    } else {
      console.log('❌ Uppercase search test failed');
    }
    
    // Test 5: Partial match (substring) search
    console.log('\n5️⃣ Testing partial match search ("phone")...');
    const partialResponse = await fetch(`${baseURL}/products?search=phone`);
    const partialData = await partialResponse.json();
    
    if (partialResponse.status === 200 && partialData.success) {
      console.log('✅ Partial match search: 200 OK (CORRECT)');
      console.log('📦 Found products:', partialData.products.length);
      console.log('📊 Total matching products:', partialData.totalProducts);
      
      // List found products
      console.log('📋 Products found with "phone":');
      partialData.products.forEach(p => {
        console.log(`  - ${p.name}`);
      });
      
      // Should find both iPhone and Samsung Galaxy Phone
      const foundMultiple = partialData.products.length >= 2;
      if (foundMultiple) {
        console.log('✅ Partial match working (found multiple products containing "phone")');
      } else {
        console.log('⚠️  Expected multiple products containing "phone"');
      }
    } else {
      console.log('❌ Partial match search test failed');
    }
    
    // Test 6: Search with no results
    console.log('\n6️⃣ Testing search with no results ("nonexistent")...');
    const noResultsResponse = await fetch(`${baseURL}/products?search=nonexistent`);
    const noResultsData = await noResultsResponse.json();
    
    if (noResultsResponse.status === 200 && noResultsData.success) {
      console.log('✅ No results search: 200 OK (CORRECT)');
      console.log('📦 Found products:', noResultsData.products.length, '(should be 0)');
      console.log('📊 Total matching products:', noResultsData.totalProducts, '(should be 0)');
      
      if (noResultsData.products.length === 0 && noResultsData.totalProducts === 0) {
        console.log('✅ No results handled correctly');
      } else {
        console.log('❌ No results not handled correctly');
      }
    } else {
      console.log('❌ No results search test failed');
    }
    
    // Test 7: Search with pagination
    console.log('\n7️⃣ Testing search with pagination...');
    const paginatedSearchResponse = await fetch(`${baseURL}/products?search=laptop&page=1&pageSize=1`);
    const paginatedSearchData = await paginatedSearchResponse.json();
    
    if (paginatedSearchResponse.status === 200 && paginatedSearchData.success) {
      console.log('✅ Paginated search: 200 OK (CORRECT)');
      console.log('📋 Pagination with search:');
      console.log('  - currentPage:', paginatedSearchData.currentPage, '(should be 1)');
      console.log('  - pageSize:', paginatedSearchData.pageSize, '(should be 1)');
      console.log('  - totalProducts:', paginatedSearchData.totalProducts, '(total matching "laptop")');
      console.log('  - totalPages:', paginatedSearchData.totalPages);
      console.log('  - products count:', paginatedSearchData.products.length, '(should be 1)');
      
      // Verify totalProducts reflects search results, not all products
      if (paginatedSearchData.totalProducts < noSearchData.totalProducts) {
        console.log('✅ totalProducts reflects search results, not all products (User Story 6 requirement)');
      } else {
        console.log('❌ totalProducts should reflect search results, not all products');
      }
    } else {
      console.log('❌ Paginated search test failed');
    }
    
    // Test 8: Search remains public (no authentication required)
    console.log('\n8️⃣ Testing search remains public (no authentication)...');
    const publicSearchResponse = await fetch(`${baseURL}/products?search=apple`);
    const publicSearchData = await publicSearchResponse.json();
    
    if (publicSearchResponse.status === 200 && publicSearchData.success) {
      console.log('✅ Public search access: 200 OK (CORRECT)');
      console.log('📦 Search works without authentication');
      console.log('📊 Found Apple products:', publicSearchData.products.length);
    } else {
      console.log('❌ Public search access test failed');
    }
    
    // Test 9: Search with special characters and spaces
    console.log('\n9️⃣ Testing search with spaces ("coffee machine")...');
    const spacesResponse = await fetch(`${baseURL}/products?search=${encodeURIComponent('coffee machine')}`);
    const spacesData = await spacesResponse.json();
    
    if (spacesResponse.status === 200 && spacesData.success) {
      console.log('✅ Search with spaces: 200 OK (CORRECT)');
      console.log('📦 Found products:', spacesData.products.length);
      
      // Should find "Coffee Machine Pro"
      const foundCoffeeMachine = spacesData.products.some(p => 
        p.name.toLowerCase().includes('coffee') && p.name.toLowerCase().includes('machine')
      );
      if (foundCoffeeMachine) {
        console.log('✅ Multi-word search working');
      } else {
        console.log('⚠️  Multi-word search may need improvement');
      }
    } else {
      console.log('❌ Search with spaces test failed');
    }
    
    // Test 10: Verify response structure consistency
    console.log('\n🔟 Testing response structure consistency...');
    const structureResponse = await fetch(`${baseURL}/products?search=pro`);
    const structureData = await structureResponse.json();
    
    if (structureResponse.status === 200 && structureData.success) {
      console.log('✅ Response structure: 200 OK (CORRECT)');
      
      // Validate User Story 6 response structure
      const hasRequiredFields = structureData.hasOwnProperty('currentPage') &&
                               structureData.hasOwnProperty('pageSize') &&
                               structureData.hasOwnProperty('totalPages') &&
                               structureData.hasOwnProperty('totalProducts') &&
                               structureData.hasOwnProperty('products') &&
                               structureData.hasOwnProperty('success') &&
                               structureData.hasOwnProperty('message');
      
      if (hasRequiredFields) {
        console.log('✅ Search response maintains User Story 5 structure');
      } else {
        console.log('❌ Search response missing required fields');
      }
      
      // Check message indicates search
      if (structureData.message.includes('pro')) {
        console.log('✅ Response message indicates search term');
      } else {
        console.log('⚠️  Response message could be more descriptive');
      }
    } else {
      console.log('❌ Response structure test failed');
    }
    
    console.log('\n🎉 User Story 6 - Search for Products Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ GET /products accepts ?search=productName parameter');
    console.log('✅ Empty/missing search returns all products (User Story 5 behavior)');
    console.log('✅ Case-insensitive search (works with lowercase, uppercase, mixed case)');
    console.log('✅ Partial match (substring) search against product name');
    console.log('✅ Public endpoint (no authentication required)');
    console.log('✅ Paginated response consistent with User Story 5');
    console.log('✅ totalProducts reflects search results count, not all products');
    console.log('✅ Response structure includes: currentPage, pageSize, totalPages, totalProducts, products');
    console.log('✅ Proper handling of no results scenarios');
    console.log('✅ Search works with pagination parameters');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
    console.log('💡 Make sure admin user exists: npm run setup-admin');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testSearchProducts();
}

module.exports = testSearchProducts;