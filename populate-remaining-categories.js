const { MongoClient } = require('mongodb');
require('dotenv').config();

function generateRemainingCategories() {
  const products = [];
  
  // 3. BOOKS (20 products)
  const books = [
    { name: "Ethiopian History - Complete Guide", desc: "Comprehensive history of Ethiopia from ancient times", price: 29.99, author: "Dr. Alemayehu Teshome" },
    { name: "Amharic Language Learning Book", desc: "Complete guide to learning Amharic language", price: 24.99, author: "Prof. Getachew Haile" },
    { name: "Ethiopian Cookbook - Traditional Recipes", desc: "Authentic Ethiopian recipes and cooking techniques", price: 34.99, author: "Chef Yohannes Gebremedhin" },
    { name: "Ethiopian Coffee Culture", desc: "Deep dive into Ethiopian coffee traditions and ceremonies", price: 27.99, author: "Dr. Mehari Tesfay" },
    { name: "Oromo Language Dictionary", desc: "Comprehensive Oromo-English dictionary", price: 39.99, author: "Linguist Bontu Lugo" },
    { name: "Ethiopian Orthodox Christianity", desc: "Guide to Ethiopian Orthodox faith and practices", price: 32.99, author: "Abune Paulos" },
    { name: "Ethiopian Folk Tales", desc: "Collection of traditional Ethiopian stories", price: 19.99, author: "Storyteller Almaz Eshete" },
    { name: "Ethiopian Music and Dance", desc: "Guide to traditional Ethiopian music and dance", price: 28.99, author: "Musician Aster Aweke" },
    { name: "Ethiopian Architecture Guide", desc: "Traditional and modern Ethiopian architecture", price: 45.99, author: "Architect Fasil Giorghis" },
    { name: "Ethiopian Medicinal Plants", desc: "Guide to traditional Ethiopian herbal medicine", price: 36.99, author: "Dr. Ermias Dagne" },
    { name: "Ethiopian Poetry Collection", desc: "Anthology of Ethiopian poetry in multiple languages", price: 25.99, author: "Various Poets" },
    { name: "Ethiopian Business Guide", desc: "Guide to doing business in Ethiopia", price: 42.99, author: "Economist Newai Gebre-Ab" },
    { name: "Ethiopian Travel Guide", desc: "Complete travel guide to Ethiopia's attractions", price: 31.99, author: "Travel Writer Selamawit Mecca" },
    { name: "Ethiopian Children's Stories", desc: "Collection of stories for Ethiopian children", price: 16.99, author: "Children's Author Hanna Getachew" },
    { name: "Ethiopian Art and Culture", desc: "Comprehensive guide to Ethiopian art forms", price: 38.99, author: "Art Historian Girma Fisseha" },
    { name: "Ethiopian Agriculture Manual", desc: "Modern farming techniques for Ethiopian crops", price: 33.99, author: "Agricultural Expert Taye Bezuneh" },
    { name: "Ethiopian Legal System", desc: "Guide to Ethiopian law and legal procedures", price: 47.99, author: "Legal Scholar Mehari Redae" },
    { name: "Ethiopian Women's Stories", desc: "Inspiring stories of Ethiopian women leaders", price: 26.99, author: "Feminist Writer Bogalech Gebre" },
    { name: "Ethiopian Mathematics Textbook", desc: "Advanced mathematics in Amharic", price: 29.99, author: "Prof. Mulugeta Bekele" },
    { name: "Ethiopian Environmental Guide", desc: "Guide to Ethiopia's ecosystems and conservation", price: 35.99, author: "Environmentalist Tewolde Berhan" }
  ];

  books.forEach((item, index) => {
    products.push({
      name: item.name,
      description: item.desc + `. Written by ${item.author}, expert in Ethiopian culture and knowledge.`,
      price: item.price,
      stock: 30 + Math.floor(Math.random() * 70),
      category: "books",
      brand: "Ethiopian Publishers",
      rating: { average: 4.1 + Math.random() * 0.8, count: Math.floor(Math.random() * 120) + 15 },
      tags: ["books", "ethiopian", "education", "culture", "knowledge"],
      sku: `ETH-BOOK-${String(index + 1).padStart(3, '0')}`
    });
  });

  // 4. HOME & GARDEN (25 products)
  const home = [
    { name: "Ethiopian Coffee Ceremony Set", desc: "Complete traditional coffee ceremony kit with jebena", price: 67.99, brand: "Cultural Traditions" },
    { name: "Ethiopian Woven Basket - Large", desc: "Handwoven storage basket by Ethiopian artisans", price: 28.99, brand: "Artisan Crafts" },
    { name: "Ethiopian Incense Burner", desc: "Traditional clay incense burner for ceremonies", price: 23.99, brand: "Spiritual Items" },
    { name: "Ethiopian Wall Art - Painting", desc: "Traditional Ethiopian landscape painting", price: 89.99, brand: "Ethiopian Artists" },
    { name: "Ethiopian Carpet - Handwoven", desc: "Beautiful handwoven carpet with traditional patterns", price: 234.99, brand: "Textile Arts" },
    { name: "Ethiopian Clay Pot Set", desc: "Set of traditional clay pots for cooking", price: 45.99, brand: "Pottery Ethiopia" },
    { name: "Ethiopian Wooden Stool", desc: "Handcarved wooden stool with traditional design", price: 56.99, brand: "Wood Crafts" },
    { name: "Ethiopian Spice Rack", desc: "Wooden spice rack designed for Ethiopian spices", price: 34.99, brand: "Kitchen Ethiopia" },
    { name: "Ethiopian Table Runner", desc: "Handwoven table runner with cultural motifs", price: 19.99, brand: "Home Textiles" },
    { name: "Ethiopian Candle Holders", desc: "Set of traditional candle holders for ceremonies", price: 29.99, brand: "Spiritual Items" },
    { name: "Ethiopian Garden Planter", desc: "Clay planter perfect for growing Ethiopian herbs", price: 24.99, brand: "Garden Ethiopia" },
    { name: "Ethiopian Wall Clock", desc: "Clock featuring Ethiopian calendar and time", price: 43.99, brand: "Time Keepers" },
    { name: "Ethiopian Serving Tray", desc: "Wooden serving tray with carved Ethiopian designs", price: 38.99, brand: "Serving Ware" },
    { name: "Ethiopian Pillow Covers", desc: "Set of pillow covers with traditional patterns", price: 26.99, brand: "Home Textiles" },
    { name: "Ethiopian Mirror Frame", desc: "Decorative mirror with Ethiopian cultural frame", price: 67.99, brand: "Home Decor" },
    { name: "Ethiopian Lamp Shade", desc: "Handmade lamp shade with Ethiopian motifs", price: 41.99, brand: "Lighting Ethiopia" },
    { name: "Ethiopian Storage Chest", desc: "Wooden chest with traditional Ethiopian carvings", price: 156.99, brand: "Furniture Ethiopia" },
    { name: "Ethiopian Wind Chimes", desc: "Bamboo wind chimes with Ethiopian musical notes", price: 32.99, brand: "Garden Sounds" },
    { name: "Ethiopian Flower Vase", desc: "Clay vase with traditional Ethiopian glazing", price: 35.99, brand: "Pottery Ethiopia" },
    { name: "Ethiopian Door Mat", desc: "Woven door mat with welcome message in Amharic", price: 22.99, brand: "Home Entrance" },
    { name: "Ethiopian Kitchen Towels", desc: "Set of kitchen towels with Ethiopian patterns", price: 18.99, brand: "Kitchen Textiles" },
    { name: "Ethiopian Photo Frame Set", desc: "Set of frames showcasing Ethiopian landscapes", price: 29.99, brand: "Photo Display" },
    { name: "Ethiopian Curtains", desc: "Traditional curtains with Ethiopian cultural designs", price: 78.99, brand: "Window Treatments" },
    { name: "Ethiopian Coasters Set", desc: "Wooden coasters with Ethiopian coffee motifs", price: 16.99, brand: "Table Accessories" },
    { name: "Ethiopian Garden Statue", desc: "Stone statue of Ethiopian cultural symbol", price: 89.99, brand: "Garden Art" }
  ];

  home.forEach((item, index) => {
    products.push({
      name: item.name,
      description: item.desc + ". Handcrafted by Ethiopian artisans using traditional techniques.",
      price: item.price,
      stock: 20 + Math.floor(Math.random() * 60),
      category: "home",
      brand: item.brand,
      rating: { average: 4.3 + Math.random() * 0.6, count: Math.floor(Math.random() * 90) + 8 },
      tags: ["home", "ethiopian", "handmade", "traditional", "decor"],
      sku: `ETH-HOME-${String(index + 1).padStart(3, '0')}`
    });
  });

  return products;
}

async function populateRemainingCategories() {
  console.log('🇪🇹 Adding Remaining Ethiopian Categories...\n');
  
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    console.log('📦 Generating remaining categories (Books, Home)...');
    let newProducts = generateRemainingCategories();
    
    // Add timestamps
    const productsToInsert = newProducts.map(product => ({
      ...product,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }));
    
    console.log(`💾 Adding ${productsToInsert.length} more products...`);
    const result = await db.collection('products').insertMany(productsToInsert);
    console.log(`✅ Added ${result.insertedCount} products`);
    
    // Get total count and categories
    const totalCount = await db.collection('products').countDocuments();
    console.log(`📊 Total products now: ${totalCount}`);
    
    // Show all categories
    const pipeline = [
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ];
    
    const categories = await db.collection('products').aggregate(pipeline).toArray();
    
    console.log(`\n📋 ALL CATEGORIES:`);
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} products`);
    });
    
    const productsPerPage = 12;
    const totalPages = Math.ceil(totalCount / productsPerPage);
    console.log(`\n📄 Total pages (${productsPerPage} per page): ${totalPages}`);
    
    console.log('\n🎯 Run populate-final-categories.js to add Sports, Beauty, Toys, and Food!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

populateRemainingCategories();