const { MongoClient } = require('mongodb');
require('dotenv').config();

async function makeUserAdmin() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    // Find user by email
    const user = await db.collection('users').findOne({ email: 'admin@skillbridge.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 Found user: ${user.email}`);
    
    // Update user role to admin
    const result = await db.collection('users').updateOne(
      { email: 'admin@skillbridge.com' },
      { $set: { role: 'admin' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ User role updated to admin successfully');
    } else {
      console.log('⚠️  User may already be admin');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

makeUserAdmin();