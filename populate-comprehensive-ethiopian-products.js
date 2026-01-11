const { MongoClient } = require('mongodb');
require('dotenv').config();

// Function to generate comprehensive Ethiopian product catalog
function generateEthiopianProducts() {
  const products = [];
  
  // Coffee Products (20 items)
  const coffeeRegions = ['Yirgacheffe', 'Sidamo', 'Harar', 'Limu', 'Jimma', 'Kaffa', 'Guji', 'Nekemte'];
  coffeeRegions.forEach((region, index) => {
    products.push({
      name: `${region} Single Origin Coffee - Premium`,
      description: `Exceptional coffee from the ${region} region of Ethiopia. Known for its unique flavor profile and traditional processing methods by local farmers.`,
      price: 22.99 + (index * 2),
      stock: 100 + (index * 10),
      category: "food",
      brand: "Ethiopian Highlands",
      rating: { average: 4.5 + (Math.random() * 0.4), count: Math.floor(Math.random() * 200) + 50 },
      tags: ["coffee", region.toLowerCase(), "ethiopian", "single-origin", "premium"],
      sku: `ETH-COFFEE-${region.substring(0,3).toUpperCase()}-${String(index + 1).padStart(3, '0')}`
    });
    
    // Add roasted versions
    products.push({
      name: `${region} Dark Roast Coffee`,
      description: `Dark roasted ${region} coffee beans with rich, bold flavors. Perfect for espresso and strong coffee lovers.`,
      price: 24.99 + (index * 2),
      stock: 80 + (index * 8),
      category: "food",
      brand: "Ethiopian Roasters",
      rating: { average: 4.4 + (Math.random() * 0.5), count: Math.floor(Math.random() * 150) + 30 },
      tags: ["coffee", region.toLowerCase(), "dark-roast", "ethiopian", "bold"],
      sku: `ETH-COFFEE-DR-${region.substring(0,3).toUpperCase()}-${String(index + 1).padStart(3, '0')}`
    });
  });

  // Traditional Spices and Seasonings (15 items)
  const spices = [
    { name: "Berbere Spice Blend", desc: "Traditional Ethiopian spice blend with over 15 spices", price: 12.99 },
    { name: "Mitmita Spice Mix", desc: "Fiery Ethiopian spice blend for raw meat dishes", price: 8.99 },
    { name: "Shiro Powder", desc: "Ground chickpea flour seasoned with Ethiopian spices", price: 9.99 },
    { name: "Ethiopian Cardamom", desc: "Aromatic green cardamom pods from Ethiopian highlands", price: 15.99 },
    { name: "Korarima Seeds", desc: "Ethiopian black cardamom with unique smoky flavor", price: 18.99 },
    { name: "Fenugreek Seeds", desc: "High-quality fenugreek seeds used in Ethiopian cooking", price: 7.99 },
    { name: "Ethiopian Turmeric", desc: "Fresh ground turmeric with vibrant color and flavor", price: 6.99 },
    { name: "Nigella Seeds", desc: "Black cumin seeds popular in Ethiopian cuisine", price: 8.49 },
    { name: "Ethiopian Ginger Powder", desc: "Dried and ground ginger from Ethiopian farms", price: 9.49 },
    { name: "Ajwain Seeds", desc: "Carom seeds used in traditional Ethiopian bread", price: 7.49 },
    { name: "Ethiopian Coriander", desc: "Whole coriander seeds with citrusy aroma", price: 6.49 },
    { name: "Long Pepper", desc: "Traditional Ethiopian long pepper for authentic flavor", price: 12.49 },
    { name: "Ethiopian Cloves", desc: "Aromatic whole cloves from Ethiopian spice gardens", price: 11.99 },
    { name: "Sacred Basil Seeds", desc: "Holy basil seeds used in Ethiopian traditional medicine", price: 13.99 },
    { name: "Ethiopian Allspice", desc: "Whole allspice berries with complex flavor profile", price: 10.99 }
  ];

  spices.forEach((spice, index) => {
    products.push({
      name: spice.name,
      description: spice.desc + ". Sourced directly from Ethiopian farmers and spice merchants.",
      price: spice.price,
      stock: 150 + (index * 5),
      category: "food",
      brand: "Addis Spices",
      rating: { average: 4.3 + (Math.random() * 0.6), count: Math.floor(Math.random() * 100) + 25 },
      tags: ["spices", "ethiopian", "traditional", "cooking", "authentic"],
      sku: `ETH-SPICE-${String(index + 1).padStart(3, '0')}`
    });
  });

  return products;
}

async function populateComprehensiveEthiopianProducts() {
  console.log('🇪🇹 Populating Comprehensive Ethiopian Products Database...\n');
  
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    console.log('🗑️ Clearing existing products...');
    const deleteResult = await db.collection('products').deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing products`);
    
    console.log('📦 Generating Ethiopian products...');
    const products = generateEthiopianProducts();
    
    // Add timestamps to all products
    const productsToInsert = products.map(product => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    console.log(`💾 Inserting ${productsToInsert.length} products...`);
    const result = await db.collection('products').insertMany(productsToInsert);
    console.log(`✅ Inserted ${result.insertedCount} Ethiopian products`);
    
    // Calculate pages (assuming 12 products per page)
    const productsPerPage = 12;
    const totalPages = Math.ceil(result.insertedCount / productsPerPage);
    
    console.log(`📊 Total products: ${result.insertedCount}`);
    console.log(`📄 Total pages (12 per page): ${totalPages}`);
    
    if (totalPages >= 11) {
      console.log('🎉 Successfully created 11+ pages of products!');
    } else {
      console.log(`⚠️  Only ${totalPages} pages created. Need ${11 - totalPages} more pages.`);
    }
    
  } catch (error) {
    console.error('❌ Error populating products:', error.message);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

populateComprehensiveEthiopianProducts();