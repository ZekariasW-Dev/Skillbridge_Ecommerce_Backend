const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testEthiopianCatalogPagination() {
  console.log('🇪🇹 Testing Ethiopian Product Catalog Pagination...\n');

  try {
    // Test pagination across multiple pages
    console.log('📄 Testing pagination...');
    
    for (let page = 1; page <= 5; page++) {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: { page, pageSize: 12 }
      });
      
      if (response.data.success) {
        const products = response.data.products;
        console.log(`Page ${page}: ${products.length} products`);
        
        // Show first 3 products on each page
        products.slice(0, 3).forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
        });
        
        if (products.length > 3) {
          console.log(`   ... and ${products.length - 3} more products`);
        }
      }
    }

    // Test total count
    console.log('\n📊 Getting total statistics...');
    const statsResponse = await axios.get(`${API_BASE_URL}/products`, {
      params: { page: 1, pageSize: 1 }
    });
    
    if (statsResponse.data.success) {
      const totalPages = statsResponse.data.totalPages;
      const totalSize = statsResponse.data.totalSize || statsResponse.data.pagination?.totalSize;
      
      console.log(`✅ Total products: ${totalSize}`);
      console.log(`✅ Total pages: ${totalPages}`);
      console.log(`✅ Products per page: 12`);
      
      if (totalPages >= 11) {
        console.log('🎯 SUCCESS: 11+ pages achieved!');
      } else {
        console.log(`⚠️  Only ${totalPages} pages available`);
      }
    }

    // Test different categories
    console.log('\n🏷️ Testing category filtering...');
    const categoryResponse = await axios.get(`${API_BASE_URL}/products`, {
      params: { category: 'food', pageSize: 5 }
    });
    
    if (categoryResponse.data.success) {
      console.log(`Food category: ${categoryResponse.data.products.length} products shown`);
      categoryResponse.data.products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.category}`);
      });
    }

    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const searchTerms = ['coffee', 'spice', 'ethiopian'];
    
    for (const term of searchTerms) {
      const searchResponse = await axios.get(`${API_BASE_URL}/products`, {
        params: { search: term, pageSize: 3 }
      });
      
      if (searchResponse.data.success) {
        console.log(`Search "${term}": ${searchResponse.data.products.length} results`);
        searchResponse.data.products.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name}`);
        });
      }
    }

    console.log('\n🎉 Ethiopian catalog pagination test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testEthiopianCatalogPagination();