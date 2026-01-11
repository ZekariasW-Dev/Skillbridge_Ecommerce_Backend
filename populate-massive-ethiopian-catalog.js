const { MongoClient } = require('mongodb');
require('dotenv').config();

function generateMassiveEthiopianCatalog() {
  const products = [];
  
  // 1. Coffee Products (40 items - 4 pages)
  const coffeeData = [
    { region: 'Yirgacheffe', notes: 'floral and bright', price: 24.99 },
    { region: 'Sidamo', notes: 'wine-like with chocolate hints', price: 22.50 },
    { region: 'Harar', notes: 'fruity and bold', price: 26.99 },
    { region: 'Limu', notes: 'balanced with citrus notes', price: 23.99 },
    { region: 'Jimma', notes: 'earthy and full-bodied', price: 21.99 },
    { region: 'Kaffa', notes: 'birthplace of coffee, complex', price: 28.99 },
    { region: 'Guji', notes: 'sweet and floral', price: 25.99 },
    { region: 'Nekemte', notes: 'spicy and aromatic', price: 24.49 }
  ];
  
  const roastLevels = ['Light Roast', 'Medium Roast', 'Dark Roast', 'French Roast', 'Espresso Roast'];
  
  coffeeData.forEach((coffee, regionIndex) => {
    roastLevels.forEach((roast, roastIndex) => {
      products.push({
        name: `${coffee.region} ${roast} Coffee`,
        description: `Premium ${coffee.region} coffee with ${coffee.notes}. ${roast} brings out unique characteristics of this Ethiopian region.`,
        price: coffee.price + (roastIndex * 1.5),
        stock: 80 + Math.floor(Math.random() * 50),
        category: "food",
        brand: "Ethiopian Coffee Co.",
        rating: { average: 4.3 + Math.random() * 0.6, count: Math.floor(Math.random() * 200) + 30 },
        tags: ["coffee", coffee.region.toLowerCase(), roast.toLowerCase().replace(' ', '-'), "ethiopian"],
        sku: `ETH-CF-${coffee.region.substring(0,3).toUpperCase()}-${roast.substring(0,2).toUpperCase()}-${String(regionIndex * 5 + roastIndex + 1).padStart(3, '0')}`
      });
    });
  });

  // 2. Traditional Foods & Spices (30 items - 3 pages)
  const traditionalFoods = [
    { name: "Berbere Spice Blend - Mild", price: 11.99, desc: "Mild version of traditional Ethiopian spice blend" },
    { name: "Berbere Spice Blend - Hot", price: 12.99, desc: "Spicy traditional Ethiopian spice blend" },
    { name: "Berbere Spice Blend - Extra Hot", price: 13.99, desc: "Very spicy traditional Ethiopian spice blend" },
    { name: "Mitmita Spice Mix", price: 8.99, desc: "Fiery Ethiopian spice blend for kitfo" },
    { name: "Shiro Powder - Chickpea", price: 9.99, desc: "Ground chickpea flour with Ethiopian spices" },
    { name: "Shiro Powder - Lentil", price: 10.99, desc: "Ground lentil flour with Ethiopian spices" },
    { name: "Ethiopian Honey - Wildflower", price: 18.99, desc: "Pure wildflower honey from Ethiopian highlands" },
    { name: "Ethiopian Honey - Acacia", price: 22.99, desc: "Premium acacia honey with delicate flavor" },
    { name: "Teff Flour - Brown", price: 12.49, desc: "Ancient Ethiopian grain flour for injera" },
    { name: "Teff Flour - White", price: 13.49, desc: "Premium white teff flour for traditional bread" },
    { name: "Ethiopian Barley", price: 7.99, desc: "Whole barley grains for traditional porridge" },
    { name: "Ethiopian Lentils - Red", price: 6.99, desc: "Red lentils perfect for Ethiopian stews" },
    { name: "Ethiopian Lentils - Black", price: 8.99, desc: "Black beluga lentils with rich flavor" },
    { name: "Ethiopian Chickpeas", price: 5.99, desc: "Dried chickpeas for traditional dishes" },
    { name: "Ethiopian Split Peas", price: 6.49, desc: "Yellow split peas for hearty stews" },
    { name: "Korarima Seeds", price: 18.99, desc: "Ethiopian black cardamom with smoky flavor" },
    { name: "Ethiopian Cardamom", price: 15.99, desc: "Green cardamom pods from highland farms" },
    { name: "Long Pepper", price: 12.49, desc: "Traditional Ethiopian long pepper spice" },
    { name: "Ethiopian Ginger - Fresh Dried", price: 9.49, desc: "Dried ginger root with intense flavor" },
    { name: "Ethiopian Turmeric", price: 6.99, desc: "Ground turmeric with vibrant color" },
    { name: "Fenugreek Seeds", price: 7.99, desc: "Aromatic fenugreek seeds for cooking" },
    { name: "Nigella Seeds", price: 8.49, desc: "Black cumin seeds for bread and stews" },
    { name: "Ethiopian Coriander", price: 6.49, desc: "Whole coriander seeds with citrus notes" },
    { name: "Ethiopian Cloves", price: 11.99, desc: "Aromatic whole cloves for spice blends" },
    { name: "Ethiopian Cinnamon", price: 9.99, desc: "True cinnamon bark with sweet aroma" },
    { name: "Ajwain Seeds", price: 7.49, desc: "Carom seeds for traditional Ethiopian bread" },
    { name: "Ethiopian Allspice", price: 10.99, desc: "Whole allspice berries with complex flavor" },
    { name: "Sacred Basil Seeds", price: 13.99, desc: "Holy basil seeds for traditional medicine" },
    { name: "Ethiopian Black Pepper", price: 14.99, desc: "Whole black peppercorns with heat" },
    { name: "Ethiopian White Pepper", price: 16.99, desc: "Ground white pepper with subtle heat" }
  ];

  traditionalFoods.forEach((food, index) => {
    products.push({
      name: food.name,
      description: food.desc + ". Sourced directly from Ethiopian farmers and traditional markets.",
      price: food.price,
      stock: 100 + Math.floor(Math.random() * 100),
      category: "food",
      brand: "Ethiopian Traditions",
      rating: { average: 4.2 + Math.random() * 0.7, count: Math.floor(Math.random() * 150) + 20 },
      tags: ["ethiopian", "traditional", "spices", "authentic", "food"],
      sku: `ETH-FOOD-${String(index + 1).padStart(3, '0')}`
    });
  });

  return products;
}

async function populateMassiveEthiopianCatalog() {
  console.log('🇪🇹 Creating Massive Ethiopian Product Catalog...\n');
  
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    console.log('🗑️ Clearing existing products...');
    const deleteResult = await db.collection('products').deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing products`);
    
    console.log('📦 Generating massive Ethiopian product catalog...');
    let allProducts = generateMassiveEthiopianCatalog();
    
    // Add more products to reach 11+ pages (132+ products for 12 per page)
    const targetProducts = 150; // 12.5 pages
    
    while (allProducts.length < targetProducts) {
      // Generate variations of existing products
      const baseProduct = allProducts[Math.floor(Math.random() * Math.min(allProducts.length, 20))];
      const variations = ['Premium', 'Organic', 'Fair Trade', 'Single Farm', 'Artisan'];
      const variation = variations[Math.floor(Math.random() * variations.length)];
      
      const newProduct = {
        ...baseProduct,
        name: `${variation} ${baseProduct.name}`,
        description: `${variation} quality ${baseProduct.description}`,
        price: baseProduct.price + Math.random() * 5 + 2,
        stock: 50 + Math.floor(Math.random() * 100),
        sku: `${baseProduct.sku}-${variation.substring(0,2).toUpperCase()}`,
        tags: [...baseProduct.tags, variation.toLowerCase().replace(' ', '-')]
      };
      
      allProducts.push(newProduct);
    }
    
    // Add timestamps to all products
    const productsToInsert = allProducts.map(product => ({
      ...product,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random dates within last 30 days
      updatedAt: new Date()
    }));
    
    console.log(`💾 Inserting ${productsToInsert.length} products...`);
    const result = await db.collection('products').insertMany(productsToInsert);
    console.log(`✅ Inserted ${result.insertedCount} Ethiopian products`);
    
    // Calculate pages
    const productsPerPage = 12;
    const totalPages = Math.ceil(result.insertedCount / productsPerPage);
    
    console.log(`\n📊 CATALOG SUMMARY:`);
    console.log(`📦 Total products: ${result.insertedCount}`);
    console.log(`📄 Total pages (${productsPerPage} per page): ${totalPages}`);
    console.log(`🎯 Target achieved: ${totalPages >= 11 ? '✅ YES' : '❌ NO'}`);
    
    // Show category breakdown
    const categories = {};
    productsToInsert.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    
    console.log(`\n📋 CATEGORY BREAKDOWN:`);
    Object.entries(categories).forEach(([category, count]) => {
      const pages = Math.ceil(count / productsPerPage);
      console.log(`   ${category}: ${count} products (${pages} pages)`);
    });
    
    console.log('\n🎉 Massive Ethiopian catalog created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating catalog:', error.message);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

populateMassiveEthiopianCatalog();