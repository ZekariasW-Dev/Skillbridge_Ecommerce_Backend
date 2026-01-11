const { MongoClient } = require('mongodb');
require('dotenv').config();

const ethiopianProducts = [
  // Traditional Ethiopian Coffee
  {
    name: "Yirgacheffe Single Origin Coffee",
    description: "Premium Ethiopian coffee from the Yirgacheffe region, known for its bright acidity and floral notes. Hand-picked and sun-dried by local farmers.",
    price: 24.99,
    stock: 150,
    category: "food",
    brand: "Ethiopian Highlands",
    rating: { average: 4.8, count: 127 },
    tags: ["coffee", "organic", "single-origin", "ethiopian", "premium"],
    sku: "ETH-COFFEE-YRG-001"
  },
  {
    name: "Sidamo Coffee Beans",
    description: "Rich and full-bodied coffee from the Sidamo region. Features wine-like acidity with hints of chocolate and spice.",
    price: 22.50,
    stock: 200,
    category: "food",
    brand: "Ethiopian Highlands",
    rating: { average: 4.7, count: 89 },
    tags: ["coffee", "sidamo", "ethiopian", "arabica"],
    sku: "ETH-COFFEE-SID-002"
  },
  {
    name: "Harar Coffee - Ancient Variety",
    description: "One of the oldest coffee varieties in the world from the ancient city of Harar. Bold flavor with fruity undertones.",
    price: 26.99,
    stock: 120,
    category: "food",
    brand: "Ancient Grounds",
    rating: { average: 4.9, count: 156 },
    tags: ["coffee", "harar", "ancient", "ethiopian", "premium"],
    sku: "ETH-COFFEE-HAR-003"
  },

  // Traditional Ethiopian Spices
  {
    name: "Berbere Spice Blend - Authentic",
    description: "Traditional Ethiopian spice blend with over 15 spices including chili peppers, garlic, ginger, and fenugreek. Essential for Ethiopian cuisine.",
    price: 12.99,
    stock: 300,
    category: "food",
    brand: "Addis Spices",
    rating: { average: 4.6, count: 234 },
    tags: ["spices", "berbere", "ethiopian", "traditional", "cooking"],
    sku: "ETH-SPICE-BER-004"
  },
  {
    name: "Mitmita Spice Mix",
    description: "Fiery Ethiopian spice blend perfect for kitfo and other raw meat dishes. Contains bird's eye chili and cardamom.",
    price: 8.99,
    stock: 180,
    category: "food",
    brand: "Addis Spices",
    rating: { average: 4.5, count: 67 },
    tags: ["spices", "mitmita", "hot", "ethiopian", "traditional"],
    sku: "ETH-SPICE-MIT-005"
  },

  // Traditional Ethiopian Clothing
  {
    name: "Traditional Habesha Kemis - White",
    description: "Beautiful handwoven Ethiopian traditional dress with intricate border designs. Made from pure cotton by skilled artisans.",
    price: 89.99,
    stock: 45,
    category: "clothing",
    brand: "Habesha Heritage",
    rating: { average: 4.8, count: 23 },
    tags: ["traditional", "habesha", "kemis", "handwoven", "cotton"],
    sku: "ETH-CLOTH-KEM-006"
  },
  {
    name: "Ethiopian Netela Shawl",
    description: "Traditional Ethiopian cotton shawl with beautiful woven patterns. Perfect for special occasions and cultural events.",
    price: 34.99,
    stock: 80,
    category: "clothing",
    brand: "Habesha Heritage",
    rating: { average: 4.7, count: 41 },
    tags: ["netela", "shawl", "traditional", "cotton", "handwoven"],
    sku: "ETH-CLOTH-NET-007"
  },
  {
    name: "Men's Traditional Ethiopian Shirt",
    description: "Elegant white cotton shirt with traditional Ethiopian embroidery. Perfect for cultural celebrations and formal events.",
    price: 45.99,
    stock: 60,
    category: "clothing",
    brand: "Habesha Heritage",
    rating: { average: 4.6, count: 18 },
    tags: ["men", "traditional", "shirt", "embroidery", "formal"],
    sku: "ETH-CLOTH-MEN-008"
  },

  // Ethiopian Handicrafts
  {
    name: "Ethiopian Woven Basket - Large",
    description: "Beautiful handwoven basket made by Ethiopian artisans using traditional techniques. Perfect for home decoration or storage.",
    price: 28.99,
    stock: 75,
    category: "home",
    brand: "Artisan Crafts",
    rating: { average: 4.5, count: 34 },
    tags: ["basket", "handwoven", "artisan", "home-decor", "traditional"],
    sku: "ETH-HOME-BAS-009"
  },
  {
    name: "Ethiopian Coffee Ceremony Set",
    description: "Complete traditional coffee ceremony set including clay pot (jebena), cups, and incense burner. Authentic Ethiopian experience.",
    price: 67.99,
    stock: 40,
    category: "home",
    brand: "Cultural Traditions",
    rating: { average: 4.9, count: 78 },
    tags: ["coffee-ceremony", "jebena", "traditional", "cultural", "authentic"],
    sku: "ETH-HOME-COF-010"
  }
];

async function populateEthiopianProducts() {
  console.log('🇪🇹 Populating Ethiopian Products Database...\n');
  
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    console.log('🗑️ Clearing existing products...');
    const deleteResult = await db.collection('products').deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing products`);
    
    console.log('📦 Adding Ethiopian products...');
    
    // Add timestamps and generate more products
    const productsToInsert = [];
    
    // Add base products
    ethiopianProducts.forEach(product => {
      productsToInsert.push({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    console.log(`💾 Inserting ${productsToInsert.length} products...`);
    const result = await db.collection('products').insertMany(productsToInsert);
    console.log(`✅ Inserted ${result.insertedCount} Ethiopian products`);
    
    // Get total count
    const totalCount = await db.collection('products').countDocuments();
    console.log(`📊 Total products in database: ${totalCount}`);
    
    console.log('\n🎉 Ethiopian products populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating products:', error.message);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

populateEthiopianProducts();