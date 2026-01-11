const { MongoClient } = require('mongodb');

async function checkProducts() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    const products = await db.collection('products').find({}).limit(10).toArray();
    console.log('Products in DB:');
    products.forEach(p => console.log(`- ${p.name}: $${p.price}`));
    
    // Check total count
    const count = await db.collection('products').countDocuments();
    console.log(`\nTotal products: ${count}`);
    
  } finally {
    await client.close();
  }
}

checkProducts();