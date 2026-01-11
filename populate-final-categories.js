const { MongoClient } = require('mongodb');
require('dotenv').config();

function generateFinalCategories() {
  const products = [];
  
  // 5. SPORTS (15 products)
  const sports = [
    { name: "Ethiopian Running Shoes", desc: "Professional running shoes inspired by Ethiopian marathoners", price: 129.99, brand: "EthioRun" },
    { name: "Ethiopian National Team Jersey", desc: "Official replica jersey of Ethiopian national football team", price: 44.99, brand: "Sports Ethiopia" },
    { name: "Ethiopian Marathon Training Guide", desc: "Training manual used by Ethiopian distance runners", price: 32.99, brand: "Athletic Ethiopia" },
    { name: "Ethiopian Highlands Hiking Boots", desc: "Durable boots designed for Ethiopian mountain terrain", price: 156.99, brand: "Mountain Gear" },
    { name: "Ethiopian Coffee Runner's Mug", desc: "Insulated mug for runners who love Ethiopian coffee", price: 23.99, brand: "Runner's Choice" },
    { name: "Ethiopian Athletics Shorts", desc: "Lightweight shorts worn by Ethiopian athletes", price: 34.99, brand: "Athletic Wear" },
    { name: "Ethiopian Traditional Wrestling Gear", desc: "Equipment for traditional Ethiopian wrestling", price: 89.99, brand: "Traditional Sports" },
    { name: "Ethiopian Cycling Jersey", desc: "Cycling jersey with Ethiopian flag design", price: 67.99, brand: "Cycle Ethiopia" },
    { name: "Ethiopian Soccer Ball", desc: "Official soccer ball with Ethiopian colors", price: 28.99, brand: "Sports Equipment" },
    { name: "Ethiopian Fitness Tracker", desc: "Fitness tracker calibrated for high altitude training", price: 199.99, brand: "FitEthio" },
    { name: "Ethiopian Swimming Goggles", desc: "Goggles designed for Ethiopian swimming pools", price: 19.99, brand: "Swim Ethiopia" },
    { name: "Ethiopian Basketball", desc: "Basketball with Ethiopian Basketball Federation logo", price: 35.99, brand: "Hoop Ethiopia" },
    { name: "Ethiopian Yoga Mat", desc: "Yoga mat with Ethiopian spiritual symbols", price: 45.99, brand: "Zen Ethiopia" },
    { name: "Ethiopian Tennis Racket", desc: "Tennis racket used in Ethiopian tennis clubs", price: 89.99, brand: "Tennis Ethiopia" },
    { name: "Ethiopian Sports Water Bottle", desc: "Insulated bottle perfect for Ethiopian climate", price: 16.99, brand: "Hydrate Ethiopia" }
  ];

  sports.forEach((item, index) => {
    products.push({
      name: item.name,
      description: item.desc + ". Designed for Ethiopian athletes and sports enthusiasts.",
      price: item.price,
      stock: 25 + Math.floor(Math.random() * 50),
      category: "sports",
      brand: item.brand,
      rating: { average: 4.2 + Math.random() * 0.7, count: Math.floor(Math.random() * 85) + 12 },
      tags: ["sports", "ethiopian", "athletics", "fitness"],
      sku: `ETH-SPORT-${String(index + 1).padStart(3, '0')}`
    });
  });

  // 6. BEAUTY (20 products)
  const beauty = [
    { name: "Ethiopian Shea Butter - Pure", desc: "100% pure shea butter from Ethiopian trees", price: 18.99, brand: "Natural Ethiopia" },
    { name: "Ethiopian Coffee Body Scrub", desc: "Exfoliating scrub made with Ethiopian coffee grounds", price: 24.99, brand: "Coffee Beauty" },
    { name: "Ethiopian Honey Face Mask", desc: "Natural face mask with Ethiopian wildflower honey", price: 16.99, brand: "Honey Glow" },
    { name: "Ethiopian Black Soap", desc: "Traditional black soap with Ethiopian herbs", price: 12.99, brand: "Herbal Ethiopia" },
    { name: "Ethiopian Argan Oil", desc: "Pure argan oil for hair and skin care", price: 29.99, brand: "Oil Ethiopia" },
    { name: "Ethiopian Henna Powder", desc: "Natural henna powder for hair coloring", price: 14.99, brand: "Natural Color" },
    { name: "Ethiopian Lip Balm Set", desc: "Set of lip balms with Ethiopian beeswax", price: 19.99, brand: "Lip Care Ethiopia" },
    { name: "Ethiopian Perfume Oil", desc: "Traditional perfume oil with Ethiopian scents", price: 34.99, brand: "Scent Ethiopia" },
    { name: "Ethiopian Hair Oil", desc: "Nourishing hair oil with Ethiopian botanicals", price: 22.99, brand: "Hair Care Ethiopia" },
    { name: "Ethiopian Face Cream", desc: "Moisturizing cream with Ethiopian plant extracts", price: 27.99, brand: "Skin Ethiopia" },
    { name: "Ethiopian Kohl Eyeliner", desc: "Traditional kohl eyeliner used by Ethiopian women", price: 15.99, brand: "Eye Beauty" },
    { name: "Ethiopian Body Lotion", desc: "Hydrating lotion with Ethiopian shea butter", price: 21.99, brand: "Body Care Ethiopia" },
    { name: "Ethiopian Soap Set", desc: "Set of handmade soaps with Ethiopian ingredients", price: 32.99, brand: "Soap Craft Ethiopia" },
    { name: "Ethiopian Facial Toner", desc: "Natural toner with Ethiopian rose water", price: 18.99, brand: "Face Care Ethiopia" },
    { name: "Ethiopian Nail Polish Set", desc: "Nail polish set with Ethiopian flag colors", price: 25.99, brand: "Nail Art Ethiopia" },
    { name: "Ethiopian Massage Oil", desc: "Relaxing massage oil with Ethiopian essential oils", price: 28.99, brand: "Wellness Ethiopia" },
    { name: "Ethiopian Exfoliating Gloves", desc: "Traditional exfoliating gloves for bathing", price: 9.99, brand: "Bath Ethiopia" },
    { name: "Ethiopian Hair Mask", desc: "Deep conditioning mask with Ethiopian oils", price: 23.99, brand: "Hair Treatment" },
    { name: "Ethiopian Sunscreen", desc: "Natural sunscreen for Ethiopian highland sun", price: 19.99, brand: "Sun Protection" },
    { name: "Ethiopian Beauty Tool Set", desc: "Set of traditional beauty tools and applicators", price: 31.99, brand: "Beauty Tools Ethiopia" }
  ];

  beauty.forEach((item, index) => {
    products.push({
      name: item.name,
      description: item.desc + ". Made with natural Ethiopian ingredients and traditional methods.",
      price: item.price,
      stock: 40 + Math.floor(Math.random() * 60),
      category: "beauty",
      brand: item.brand,
      rating: { average: 4.4 + Math.random() * 0.5, count: Math.floor(Math.random() * 110) + 20 },
      tags: ["beauty", "ethiopian", "natural", "skincare", "traditional"],
      sku: `ETH-BEAUTY-${String(index + 1).padStart(3, '0')}`
    });
  });

  return products;
}

async function populateFinalCategories() {
  console.log('🇪🇹 Adding Final Ethiopian Categories (Sports & Beauty)...\n');
  
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    console.log('📦 Generating final categories...');
    let newProducts = generateFinalCategories();
    
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
    
    console.log('\n🎯 Run populate-toys-food.js to complete all categories!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

populateFinalCategories();