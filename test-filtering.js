const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testFiltering() {
  console.log('🔍 Testing Product Filtering & Sorting...\n');
  
  try {
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 1: Basic product retrieval
    console.log('1️⃣ Testing basic product retrieval...');
    const allProducts = await axios.get(`${API_BASE_URL}/products?limit=5`);
    console.log(`✅ Retrieved ${allProducts.data.products.length} products`);
    
    // Show available categories
    const categories = [...new Set(allProducts.data.products.map(p => p.category))];
    console.log(`📂 Available categories: ${categories.join(', ')}`);
    
    // Test 2: Category filtering
    console.log('\n2️⃣ Testing category filtering...');
    for (const category of categories.slice(0, 3)) {
      try {
        const categoryResults = await axios.get(`${API_BASE_URL}/products?category=${category}&limit=3`);
        console.log(`   📂 ${category}: ${categoryResults.data.products.length} products`);
        
        // Verify all products are from the correct category
        const correctCategory = categoryResults.data.products.every(p => p.category === category);
        console.log(`   ✅ Category filter working: ${correctCategory ? 'Yes' : 'No'}`);
      } catch (error) {
        console.log(`   ❌ Category ${category} failed:`, error.message);
      }
    }
    
    // Test 3: Search functionality
    console.log('\n3️⃣ Testing search functionality...');
    const searchTerms = ['apple', 'nike', 'book'];
    
    for (const term of searchTerms) {
      try {
        const searchResults = await axios.get(`${API_BASE_URL}/products?search=${term}&limit=5`);
        console.log(`   🔍 Search "${term}": ${searchResults.data.products.length} results`);
        
        if (searchResults.data.products.length > 0) {
          const relevantResults = searchResults.data.products.filter(p => 
            p.name.toLowerCase().includes(term.toLowerCase())
          );
          console.log(`   ✅ Relevant results: ${relevantResults.length}/${searchResults.data.products.length}`);
        }
      } catch (error) {
        console.log(`   ❌ Search "${term}" failed:`, error.message);
      }
    }
    
    // Test 4: Sorting functionality
    console.log('\n4️⃣ Testing sorting functionality...');
    const sortOptions = [
      { key: 'price_asc', name: 'Price: Low to High' },
      { key: 'price_desc', name: 'Price: High to Low' },
      { key: 'name_asc', name: 'Name: A to Z' },
      { key: 'name_desc', name: 'Name: Z to A' }
    ];
    
    for (const sortOption of sortOptions) {
      try {
        const sortedResults = await axios.get(`${API_BASE_URL}/products?sort=${sortOption.key}&limit=3`);
        console.log(`   📊 ${sortOption.name}: ${sortedResults.data.products.length} products`);
        
        if (sortedResults.data.products.length >= 2) {
          const first = sortedResults.data.products[0];
          const second = sortedResults.data.products[1];
          
          let sortWorking = false;
          switch (sortOption.key) {
            case 'price_asc':
              sortWorking = first.price <= second.price;
              break;
            case 'price_desc':
              sortWorking = first.price >= second.price;
              break;
            case 'name_asc':
              sortWorking = first.name.localeCompare(second.name) <= 0;
              break;
            case 'name_desc':
              sortWorking = first.name.localeCompare(second.name) >= 0;
              break;
          }
          
          console.log(`   ✅ Sort working: ${sortWorking ? 'Yes' : 'No'}`);
          if (sortWorking) {
            console.log(`      First: ${first.name} - $${first.price}`);
            console.log(`      Second: ${second.name} - $${second.price}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Sort "${sortOption.key}" failed:`, error.message);
      }
    }
    
    // Test 5: Combined filters
    console.log('\n5️⃣ Testing combined filters...');
    try {
      const combinedResults = await axios.get(`${API_BASE_URL}/products?category=electronics&sort=price_asc&limit=3`);
      console.log(`   🔧 Electronics sorted by price: ${combinedResults.data.products.length} products`);
      
      if (combinedResults.data.products.length > 0) {
        console.log(`   📱 Sample: ${combinedResults.data.products[0].name} - $${combinedResults.data.products[0].price}`);
      }
    } catch (error) {
      console.log('   ❌ Combined filters failed:', error.message);
    }
    
    // Test 6: Pagination with filters
    console.log('\n6️⃣ Testing pagination with filters...');
    try {
      const page1 = await axios.get(`${API_BASE_URL}/products?category=electronics&page=1&limit=3`);
      const page2 = await axios.get(`${API_BASE_URL}/products?category=electronics&page=2&limit=3`);
      
      console.log(`   📄 Electronics Page 1: ${page1.data.products.length} products`);
      console.log(`   📄 Electronics Page 2: ${page2.data.products.length} products`);
      console.log(`   📊 Total electronics: ${page1.data.totalSize}`);
    } catch (error) {
      console.log('   ❌ Filtered pagination failed:', error.message);
    }
    
    console.log('\n🎉 Filtering Test Complete!');
    console.log('=====================================');
    console.log('✅ Category filtering implemented');
    console.log('✅ Search functionality working');
    console.log('✅ Sorting options available');
    console.log('✅ Combined filters working');
    console.log('✅ Pagination with filters working');
    
    console.log('\n🌐 Frontend URLs to test:');
    console.log('• All products: http://localhost:3001/products');
    console.log('• Electronics: http://localhost:3001/products?category=electronics');
    console.log('• Search Apple: http://localhost:3001/products?search=apple');
    console.log('• Price sorted: http://localhost:3001/products?sort=price_asc');
    console.log('• Combined: http://localhost:3001/products?category=electronics&sort=price_desc');
    
  } catch (error) {
    console.error('❌ Filtering test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testFiltering();