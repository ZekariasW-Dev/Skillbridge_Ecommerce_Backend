const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb+srv://zekarias:zack%40123@cluster0.j4lbgu9.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

async function fixAdminPassword() {
  let client;
  
  try {
    console.log('🔧 Fixing admin password...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('ecommerce');
    
    // Hash the password properly
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    // Update admin user
    const result = await db.collection('users').updateOne(
      { email: 'admin@skillbridge.com' },
      { 
        $set: { 
          password: hashedPassword,
          role: 'admin',
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Admin password updated successfully');
    } else {
      console.log('ℹ️ Admin user not found or no changes needed');
    }
    
    // Verify the admin user
    const admin = await db.collection('users').findOne({ email: 'admin@skillbridge.com' });
    console.log('👤 Admin user verified:', {
      email: admin.email,
      username: admin.username,
      role: admin.role,
      hasPassword: !!admin.password
    });
    
    // Test password verification
    const isValid = await bcrypt.compare('Admin123!', admin.password);
    console.log('🔐 Password verification:', isValid ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

fixAdminPassword();