const { MongoClient } = require('mongodb');
require('dotenv').config();

function generateAllCategoriesEthiopian() {
  const products = [];
  
  // 1. ELECTRONICS (25 products)
  const electronics = [
    { name: "Ethiopian Solar Radio", desc: "Solar-powered radio with Ethiopian music stations", price: 45.99, brand: "EthioTech" },
    { name: "Addis Ababa Smart Phone", desc: "Smartphone with Amharic keyboard and Ethiopian apps", price: 299.99, brand: "EthioMobile" },
    { name: "Ethiopian Coffee Scale", desc: "Digital scale perfect for measuring coffee beans", price: 34.99, brand: "Coffee Pro" },
    { name: "Bluetooth Speaker - Ethiopian Design", desc: "Wireless speaker with traditional Ethiopian patterns", price: 89.99, brand: "EthioSound" },
    { name: "Ethiopian Language Tablet", desc: "Tablet with Amharic, Oromo, and Tigrinya support", price: 199.99, brand: "EthioTab" },
    { name: "Solar Power Bank", desc: "Portable solar charger for rural Ethiopian communities", price: 67.99, brand: "SolarEthio" },
    { name: "Ethiopian GPS Navigator", desc: "GPS device with detailed Ethiopian maps", price: 149.99, brand: "EthioNav" },
    { name: "Digital Injera Maker", desc: "Electric injera maker with temperature control", price: 234.99, brand: "ModernEthio" },
    { name: "Ethiopian Music Player", desc: "MP3 player preloaded with traditional Ethiopian music", price: 78.99, brand: "EthioMusic" },
    { name: "Smart Coffee Roaster", desc: "Automated coffee roaster for perfect Ethiopian beans", price: 399.99, brand: "RoastMaster" },
    { name: "Ethiopian Weather Station", desc: "Digital weather monitor for Ethiopian climate", price: 124.99, brand: "WeatherEthio" },
    { name: "Portable Ethiopian Translator", desc: "Electronic translator for Ethiopian languages", price: 189.99, brand: "LinguaEthio" },
    { name: "Ethiopian Radio Headphones", desc: "Wireless headphones with Ethiopian radio access", price: 56.99, brand: "AudioEthio" },
    { name: "Smart Berbere Grinder", desc: "Electric spice grinder optimized for berbere", price: 89.99, brand: "Spicetech" },
    { name: "Ethiopian Calendar Watch", desc: "Digital watch showing Ethiopian calendar", price: 134.99, brand: "TimeEthio" },
    { name: "Portable Honey Tester", desc: "Digital device to test honey purity and quality", price: 167.99, brand: "HoneyTech" },
    { name: "Ethiopian Keyboard", desc: "Computer keyboard with Amharic characters", price: 45.99, brand: "TypeEthio" },
    { name: "Solar Lantern - Ethiopian Style", desc: "Solar-powered lantern with traditional design", price: 29.99, brand: "LightEthio" },
    { name: "Ethiopian E-Reader", desc: "E-reader with Ethiopian literature collection", price: 129.99, brand: "ReadEthio" },
    { name: "Smart Teff Monitor", desc: "Device to monitor teff grain quality", price: 199.99, brand: "GrainTech" },
    { name: "Ethiopian Drone Camera", desc: "Drone for capturing Ethiopian landscapes", price: 499.99, brand: "SkyEthio" },
    { name: "Digital Incense Burner", desc: "Electric incense burner with timer", price: 67.99, brand: "AromaEthio" },
    { name: "Ethiopian Smart Scale", desc: "Kitchen scale with Ethiopian measurement units", price: 39.99, brand: "MeasureEthio" },
    { name: "Portable Ethiopian Printer", desc: "Compact printer supporting Ethiopian fonts", price: 189.99, brand: "PrintEthio" },
    { name: "Ethiopian Gaming Console", desc: "Gaming device with Ethiopian cultural games", price: 299.99, brand: "GameEthio" }
  ];

  electronics.forEach((item, index) => {
    products.push({
      name: item.name,
      description: item.desc + ". Designed specifically for Ethiopian market and culture.",
      price: item.price,
      stock: 25 + Math.floor(Math.random() * 50),
      category: "electronics",
      brand: item.brand,
      rating: { average: 4.0 + Math.random() * 0.9, count: Math.floor(Math.random() * 100) + 10 },
      tags: ["electronics", "ethiopian", "technology", "modern"],
      sku: `ETH-ELEC-${String(index + 1).padStart(3, '0')}`
    });
  });

  // 2. CLOTHING (30 products)
  const clothing = [
    { name: "Traditional Habesha Kemis - White", desc: "Handwoven Ethiopian dress with gold trim", price: 89.99, brand: "Habesha Heritage" },
    { name: "Traditional Habesha Kemis - Cream", desc: "Elegant cream-colored traditional dress", price: 94.99, brand: "Habesha Heritage" },
    { name: "Ethiopian Netela Shawl - White", desc: "Traditional cotton shawl with woven borders", price: 34.99, brand: "Textile Ethiopia" },
    { name: "Ethiopian Netela Shawl - Colored", desc: "Colorful traditional shawl with patterns", price: 39.99, brand: "Textile Ethiopia" },
    { name: "Men's Ethiopian Traditional Shirt", desc: "White cotton shirt with embroidered collar", price: 45.99, brand: "Ethiopian Menswear" },
    { name: "Ethiopian Kaba - Traditional Robe", desc: "Long traditional robe for special occasions", price: 67.99, brand: "Traditional Wear" },
    { name: "Habesha T-Shirt - Modern", desc: "Modern t-shirt with Ethiopian flag design", price: 19.99, brand: "EthioPride" },
    { name: "Ethiopian Coffee Farmer Hat", desc: "Traditional hat worn by coffee farmers", price: 24.99, brand: "Rural Wear" },
    { name: "Ethiopian Scarf - Silk", desc: "Silk scarf with Ethiopian cultural motifs", price: 29.99, brand: "Silk Ethiopia" },
    { name: "Traditional Ethiopian Pants", desc: "White cotton pants for traditional wear", price: 39.99, brand: "Traditional Wear" },
    { name: "Ethiopian Flag Hoodie", desc: "Comfortable hoodie with Ethiopian flag colors", price: 49.99, brand: "EthioPride" },
    { name: "Habesha Baby Dress", desc: "Traditional dress for Ethiopian babies", price: 34.99, brand: "Baby Ethiopia" },
    { name: "Ethiopian Orthodox Cross Necklace", desc: "Traditional silver cross pendant", price: 56.99, brand: "Religious Jewelry" },
    { name: "Ethiopian Leather Sandals", desc: "Handmade leather sandals by local artisans", price: 67.99, brand: "Leather Craft" },
    { name: "Traditional Ethiopian Belt", desc: "Woven belt with traditional patterns", price: 28.99, brand: "Accessories Ethiopia" },
    { name: "Ethiopian Wedding Dress", desc: "Elaborate traditional wedding gown", price: 299.99, brand: "Bridal Ethiopia" },
    { name: "Men's Ethiopian Suit Jacket", desc: "Modern jacket with Ethiopian design elements", price: 134.99, brand: "Ethiopian Menswear" },
    { name: "Ethiopian Cultural Headwrap", desc: "Traditional headwrap for women", price: 22.99, brand: "Head Wraps Ethiopia" },
    { name: "Ethiopian Monk Robe", desc: "Traditional robe for religious ceremonies", price: 89.99, brand: "Religious Wear" },
    { name: "Ethiopian Sports Jersey", desc: "National team replica jersey", price: 44.99, brand: "Sports Ethiopia" },
    { name: "Traditional Ethiopian Jewelry Set", desc: "Complete jewelry set with earrings and necklace", price: 78.99, brand: "Ethiopian Jewelry" },
    { name: "Ethiopian Cultural Costume", desc: "Complete traditional costume for performances", price: 156.99, brand: "Cultural Wear" },
    { name: "Ethiopian Leather Jacket", desc: "Modern leather jacket with Ethiopian styling", price: 189.99, brand: "Leather Fashion" },
    { name: "Traditional Ethiopian Shoes", desc: "Handcrafted traditional footwear", price: 89.99, brand: "Traditional Footwear" },
    { name: "Ethiopian Flag Bandana", desc: "Bandana with Ethiopian flag pattern", price: 12.99, brand: "Accessories Ethiopia" },
    { name: "Habesha Men's Traditional Vest", desc: "Embroidered vest for formal occasions", price: 67.99, brand: "Ethiopian Menswear" },
    { name: "Ethiopian Cultural Dance Costume", desc: "Colorful costume for traditional dances", price: 123.99, brand: "Dance Wear" },
    { name: "Traditional Ethiopian Cloak", desc: "Warm cloak for highland regions", price: 98.99, brand: "Highland Wear" },
    { name: "Ethiopian Artisan Bracelet", desc: "Handmade bracelet with traditional beads", price: 23.99, brand: "Artisan Jewelry" },
    { name: "Ethiopian Cultural Socks", desc: "Socks with traditional Ethiopian patterns", price: 14.99, brand: "Textile Ethiopia" }
  ];

  clothing.forEach((item, index) => {
    products.push({
      name: item.name,
      description: item.desc + ". Authentic Ethiopian clothing made by local artisans.",
      price: item.price,
      stock: 15 + Math.floor(Math.random() * 40),
      category: "clothing",
      brand: item.brand,
      rating: { average: 4.2 + Math.random() * 0.7, count: Math.floor(Math.random() * 80) + 5 },
      tags: ["clothing", "ethiopian", "traditional", "handmade"],
      sku: `ETH-CLOTH-${String(index + 1).padStart(3, '0')}`
    });
  });

  return products;
}

async function populateAllCategoriesEthiopian() {
  console.log('🇪🇹 Creating Ethiopian Products - ALL CATEGORIES...\n');
  
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    console.log('🗑️ Clearing existing products...');
    const deleteResult = await db.collection('products').deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing products`);
    
    console.log('📦 Generating Ethiopian products for all categories...');
    let allProducts = generateAllCategoriesEthiopian();
    
    console.log(`Generated ${allProducts.length} products so far...`);
    console.log('📦 This is part 1 - Electronics and Clothing completed');
    console.log('📦 Run the next script for remaining categories...');
    
    // Add timestamps
    const productsToInsert = allProducts.map(product => ({
      ...product,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }));
    
    console.log(`💾 Inserting ${productsToInsert.length} products...`);
    const result = await db.collection('products').insertMany(productsToInsert);
    console.log(`✅ Inserted ${result.insertedCount} Ethiopian products`);
    
    // Show category breakdown
    const categories = {};
    productsToInsert.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    
    console.log(`\n📋 CURRENT CATEGORIES:`);
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    console.log('\n🎯 Part 1 completed! Run populate-remaining-categories.js for the rest!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

populateAllCategoriesEthiopian();