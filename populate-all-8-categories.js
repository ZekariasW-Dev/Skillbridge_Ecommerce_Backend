const { MongoClient } = require('mongodb');
require('dotenv').config();

function generateAll8Categories() {
  const products = [];
  
  // 1. ELECTRONICS (18 products)
  const electronics = [
    "Ethiopian Solar Radio", "Addis Ababa Smart Phone", "Ethiopian Coffee Scale", 
    "Bluetooth Speaker - Ethiopian Design", "Ethiopian Language Tablet", "Solar Power Bank",
    "Ethiopian GPS Navigator", "Digital Injera Maker", "Ethiopian Music Player",
    "Smart Coffee Roaster", "Ethiopian Weather Station", "Portable Ethiopian Translator",
    "Ethiopian Radio Headphones", "Smart Berbere Grinder", "Ethiopian Calendar Watch",
    "Portable Honey Tester", "Ethiopian Keyboard", "Solar Lantern"
  ];
  
  electronics.forEach((name, index) => {
    products.push({
      name,
      description: `${name} designed specifically for Ethiopian market and culture. High quality technology product.`,
      price: 29.99 + (index * 15) + Math.random() * 50,
      stock: 20 + Math.floor(Math.random() * 80),
      category: "electronics",
      brand: "EthioTech",
      rating: { average: 4.0 + Math.random() * 0.9, count: Math.floor(Math.random() * 100) + 10 },
      tags: ["electronics", "ethiopian", "technology"],
      sku: `ETH-ELEC-${String(index + 1).padStart(3, '0')}`
    });
  });

  // 2. CLOTHING (18 products)
  const clothing = [
    "Traditional Habesha Kemis", "Ethiopian Netela Shawl", "Men's Ethiopian Traditional Shirt",
    "Ethiopian Kaba Robe", "Habesha T-Shirt", "Ethiopian Coffee Farmer Hat",
    "Ethiopian Silk Scarf", "Traditional Ethiopian Pants", "Ethiopian Flag Hoodie",
    "Habesha Baby Dress", "Ethiopian Orthodox Cross Necklace", "Ethiopian Leather Sandals",
    "Traditional Ethiopian Belt", "Ethiopian Wedding Dress", "Men's Ethiopian Suit Jacket",
    "Ethiopian Cultural Headwrap", "Ethiopian Monk Robe", "Ethiopian Sports Jersey"
  ];
  
  clothing.forEach((name, index) => {
    products.push({
      name,
      description: `${name} - Authentic Ethiopian clothing made by local artisans using traditional techniques and materials.`,
      price: 19.99 + (index * 8) + Math.random() * 30,
      stock: 15 + Math.floor(Math.random() * 60),
      category: "clothing",
      brand: "Habesha Heritage",
      rating: { average: 4.2 + Math.random() * 0.7, count: Math.floor(Math.random() * 80) + 5 },
      tags: ["clothing", "ethiopian", "traditional", "handmade"],
      sku: `ETH-CLOTH-${String(index + 1).padStart(3, '0')}`
    });
  });

  // 3. BOOKS (18 products)
  const books = [
    "Ethiopian History Complete Guide", "Amharic Language Learning Book", "Ethiopian Cookbook Traditional Recipes",
    "Ethiopian Coffee Culture", "Oromo Language Dictionary", "Ethiopian Orthodox Christianity",
    "Ethiopian Folk Tales", "Ethiopian Music and Dance", "Ethiopian Architecture Guide",
    "Ethiopian Medicinal Plants", "Ethiopian Poetry Collection", "Ethiopian Business Guide",
    "Ethiopian Travel Guide", "Ethiopian Children's Stories", "Ethiopian Art and Culture",
    "Ethiopian Agriculture Manual", "Ethiopian Legal System", "Ethiopian Women's Stories"
  ];
  
  books.forEach((name, index) => {
    products.push({
      name,
      description: `${name} - Comprehensive guide written by Ethiopian experts. Essential reading for understanding Ethiopian culture and knowledge.`,
      price: 16.99 + (index * 3) + Math.random() * 20,
      stock: 30 + Math.floor(Math.random() * 70),
      category: "books",
      brand: "Ethiopian Publishers",
      rating: { average: 4.1 + Math.random() * 0.8, count: Math.floor(Math.random() * 120) + 15 },
      tags: ["books", "ethiopian", "education", "culture"],
      sku: `ETH-BOOK-${String(index + 1).padStart(3, '0')}`
    });
  });

  // 4. HOME (18 products)
  const home = [
    "Ethiopian Coffee Ceremony Set", "Ethiopian Woven Basket", "Ethiopian Incense Burner",
    "Ethiopian Wall Art Painting", "Ethiopian Handwoven Carpet", "Ethiopian Clay Pot Set",
    "Ethiopian Wooden Stool", "Ethiopian Spice Rack", "Ethiopian Table Runner",
    "Ethiopian Candle Holders", "Ethiopian Garden Planter", "Ethiopian Wall Clock",
    "Ethiopian Serving Tray", "Ethiopian Pillow Covers", "Ethiopian Mirror Frame",
    "Ethiopian Lamp Shade", "Ethiopian Storage Chest", "Ethiopian Wind Chimes"
  ];
  
  home.forEach((name, index) => {
    products.push({
      name,
      description: `${name} - Handcrafted by Ethiopian artisans using traditional techniques. Perfect for home decoration and daily use.`,
      price: 18.99 + (index * 6) + Math.random() * 25,
      stock: 20 + Math.floor(Math.random() * 60),
      category: "home",
      brand: "Artisan Crafts",
      rating: { average: 4.3 + Math.random() * 0.6, count: Math.floor(Math.random() * 90) + 8 },
      tags: ["home", "ethiopian", "handmade", "traditional"],
      sku: `ETH-HOME-${String(index + 1).padStart(3, '0')}`
    });
  });

  // 5. SPORTS (18 products)
  const sports = [
    "Ethiopian Running Shoes", "Ethiopian National Team Jersey", "Ethiopian Marathon Training Guide",
    "Ethiopian Highlands Hiking Boots", "Ethiopian Coffee Runner's Mug", "Ethiopian Athletics Shorts",
    "Ethiopian Traditional Wrestling Gear", "Ethiopian Cycling Jersey", "Ethiopian Soccer Ball",
    "Ethiopian Fitness Tracker", "Ethiopian Swimming Goggles", "Ethiopian Basketball",
    "Ethiopian Yoga Mat", "Ethiopian Tennis Racket", "Ethiopian Sports Water Bottle",
    "Ethiopian Athletic Socks", "Ethiopian Training Gloves", "Ethiopian Sports Towel"
  ];
  
  sports.forEach((name, index) => {
    products.push({
      name,
      description: `${name} - Designed for Ethiopian athletes and sports enthusiasts. High-quality sports equipment and apparel.`,
      price: 16.99 + (index * 7) + Math.random() * 35,
      stock: 25 + Math.floor(Math.random() * 50),
      category: "sports",
      brand: "EthioSport",
      rating: { average: 4.2 + Math.random() * 0.7, count: Math.floor(Math.random() * 85) + 12 },
      tags: ["sports", "ethiopian", "athletics", "fitness"],
      sku: `ETH-SPORT-${String(index + 1).padStart(3, '0')}`
    });
  });

  // 6. BEAUTY (18 products)
  const beauty = [
    "Ethiopian Shea Butter Pure", "Ethiopian Coffee Body Scrub", "Ethiopian Honey Face Mask",
    "Ethiopian Black Soap", "Ethiopian Argan Oil", "Ethiopian Henna Powder",
    "Ethiopian Lip Balm Set", "Ethiopian Perfume Oil", "Ethiopian Hair Oil",
    "Ethiopian Face Cream", "Ethiopian Kohl Eyeliner", "Ethiopian Body Lotion",
    "Ethiopian Soap Set", "Ethiopian Facial Toner", "Ethiopian Nail Polish Set",
    "Ethiopian Massage Oil", "Ethiopian Exfoliating Gloves", "Ethiopian Hair Mask"
  ];
  
  beauty.forEach((name, index) => {
    products.push({
      name,
      description: `${name} - Made with natural Ethiopian ingredients and traditional methods. Perfect for natural beauty care.`,
      price: 9.99 + (index * 2.5) + Math.random() * 15,
      stock: 40 + Math.floor(Math.random() * 60),
      category: "beauty",
      brand: "Natural Ethiopia",
      rating: { average: 4.4 + Math.random() * 0.5, count: Math.floor(Math.random() * 110) + 20 },
      tags: ["beauty", "ethiopian", "natural", "skincare"],
      sku: `ETH-BEAUTY-${String(index + 1).padStart(3, '0')}`
    });
  });

  // 7. TOYS (18 products)
  const toys = [
    "Ethiopian Traditional Doll", "Ethiopian Animal Puzzle", "Ethiopian Building Blocks",
    "Ethiopian Cultural Board Game", "Ethiopian Stuffed Lion", "Ethiopian Musical Instruments Set",
    "Ethiopian Coloring Book", "Ethiopian Traditional Games", "Ethiopian Educational Cards",
    "Ethiopian Wooden Train", "Ethiopian Cultural Costume Dress-up", "Ethiopian Story Books for Kids",
    "Ethiopian Clay Modeling Kit", "Ethiopian Traditional Ball", "Ethiopian Learning Tablet",
    "Ethiopian Craft Making Kit", "Ethiopian Memory Game", "Ethiopian Action Figures"
  ];
  
  toys.forEach((name, index) => {
    products.push({
      name,
      description: `${name} - Educational and fun toys that teach children about Ethiopian culture and traditions. Safe and engaging.`,
      price: 12.99 + (index * 3) + Math.random() * 20,
      stock: 35 + Math.floor(Math.random() * 65),
      category: "toys",
      brand: "EthioToys",
      rating: { average: 4.3 + Math.random() * 0.6, count: Math.floor(Math.random() * 75) + 8 },
      tags: ["toys", "ethiopian", "educational", "children"],
      sku: `ETH-TOY-${String(index + 1).padStart(3, '0')}`
    });
  });

  // 8. FOOD (18 products)
  const food = [
    "Berbere Spice Blend", "Ethiopian Coffee Beans Yirgacheffe", "Mitmita Spice Mix",
    "Ethiopian Honey Wildflower", "Teff Flour Brown", "Ethiopian Lentils Red",
    "Korarima Seeds", "Ethiopian Cardamom", "Long Pepper",
    "Ethiopian Ginger Dried", "Ethiopian Turmeric", "Fenugreek Seeds",
    "Nigella Seeds", "Ethiopian Coriander", "Ethiopian Cloves",
    "Ethiopian Cinnamon", "Ajwain Seeds", "Ethiopian Allspice"
  ];
  
  food.forEach((name, index) => {
    products.push({
      name,
      description: `${name} - Authentic Ethiopian food product sourced directly from Ethiopian farmers and traditional markets. Premium quality.`,
      price: 6.99 + (index * 2) + Math.random() * 12,
      stock: 100 + Math.floor(Math.random() * 100),
      category: "food",
      brand: "Ethiopian Traditions",
      rating: { average: 4.2 + Math.random() * 0.7, count: Math.floor(Math.random() * 150) + 20 },
      tags: ["food", "ethiopian", "traditional", "spices"],
      sku: `ETH-FOOD-${String(index + 1).padStart(3, '0')}`
    });
  });

  return products;
}

async function populateAll8Categories() {
  console.log('🇪🇹 Creating Ethiopian Store with ALL 8 CATEGORIES...\n');
  
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    console.log('🗑️ Clearing existing products...');
    const deleteResult = await db.collection('products').deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing products`);
    
    console.log('📦 Generating products for all 8 categories...');
    let allProducts = generateAll8Categories();
    
    console.log(`Generated ${allProducts.length} base products`);
    
    // Add timestamps
    const productsToInsert = allProducts.map(product => ({
      ...product,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }));
    
    console.log(`💾 Inserting ${productsToInsert.length} products...`);
    const result = await db.collection('products').insertMany(productsToInsert);
    console.log(`✅ Inserted ${result.insertedCount} Ethiopian products`);
    
    // Get statistics
    const totalCount = await db.collection('products').countDocuments();
    const productsPerPage = 12;
    const totalPages = Math.ceil(totalCount / productsPerPage);
    
    console.log(`\n📊 COMPLETE STORE STATISTICS:`);
    console.log(`📦 Total products: ${totalCount}`);
    console.log(`📄 Total pages (${productsPerPage} per page): ${totalPages}`);
    console.log(`🎯 11+ pages target: ${totalPages >= 11 ? '✅ ACHIEVED' : '❌ NOT MET'}`);
    
    // Show category breakdown
    const pipeline = [
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ];
    
    const categories = await db.collection('products').aggregate(pipeline).toArray();
    
    console.log(`\n📋 ALL 8 CATEGORIES:`);
    categories.forEach(cat => {
      const pages = Math.ceil(cat.count / productsPerPage);
      console.log(`   ${cat._id}: ${cat.count} products (${pages} pages)`);
    });
    
    console.log(`\n🏪 Categories created: ${categories.length}/8`);
    
    if (categories.length === 8) {
      console.log('🎉 SUCCESS: All 8 categories created!');
    } else {
      console.log('⚠️  Some categories may be missing');
    }
    
    console.log('\n🛍️  Your Ethiopian store is now complete with diverse products!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

populateAll8Categories();