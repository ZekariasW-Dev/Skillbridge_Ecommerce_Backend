const { MongoClient } = require('mongodb');
require('dotenv').config();

async function debugOrderDatabase() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    // Check orders collection
    console.log('\n📋 Checking orders collection...');
    const orders = await db.collection('orders').find({}).limit(5).toArray();
    
    console.log(`Found ${orders.length} orders in database:`);
    orders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order ID: ${order.id}`);
      console.log(`   UserId: ${order.UserId}`);
      console.log(`   userId: ${order.userId}`);
      console.log(`   Description: ${order.description}`);
      console.log(`   Total Price: $${order.totalPrice}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Products: ${order.products?.length || 0} items`);
      console.log(`   Created: ${order.createdAt}`);
    });
    
    // Check users collection to get user ID
    console.log('\n👤 Checking users collection...');
    const users = await db.collection('users').find({ email: 'admin@skillbridge.com' }).toArray();
    
    if (users.length > 0) {
      const user = users[0];
      console.log(`Admin user ID: ${user._id}`);
      
      // Check orders for this specific user
      console.log('\n🔍 Checking orders for admin user...');
      const userOrders = await db.collection('orders').find({ 
        $or: [
          { UserId: user._id.toString() },
          { userId: user._id.toString() }
        ]
      }).toArray();
      
      console.log(`Found ${userOrders.length} orders for admin user`);
      userOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.id} - ${order.description}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

debugOrderDatabase();