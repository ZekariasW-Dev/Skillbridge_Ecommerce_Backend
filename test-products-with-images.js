const axios = require('axios');

async function testProductsWithImages() {
  try {
    console.log('🖼️ Testing Products with Images...\n');
    
    const response = await axios.get('http://localhost:3000/products');
    const products = response.data.products;
    
    console.log(`📦 Total products: ${products.length}\n`);
    
    console.log('🎯 Sample products with images:');
    products.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   💰 Price: $${product.price}`);
      console.log(`   🏷️ Category: ${product.category}`);
      console.log(`   📊 Rating: ${product.rating?.average || 'N/A'} (${product.rating?.count || 0} reviews)`);
      console.log(`   🏢 Brand: ${product.brand || 'N/A'}`);
      console.log(`   🖼️ Image: ${product.images?.primary ? '✅ Has image' : '❌ No image'}`);
      if (product.images?.primary) {
        console.log(`   🔗 URL: ${product.images.primary}`);
      }
      console.log('');
    });
    
    // Count products with images
    const productsWithImages = products.filter(p => p.images?.primary).length;
    console.log(`📊 Products with images: ${productsWithImages}/${products.length}`);
    
    // Count by category
    const categories = {};
    products.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    console.log('\n📋 Products by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    console.log('\n🎉 Products with real images are ready!');
    console.log('🌐 View them at: http://localhost:3001/products');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProductsWithImages();