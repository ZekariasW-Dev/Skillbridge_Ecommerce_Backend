const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb+srv://zekarias:zack%40123@cluster0.j4lbgu9.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 79.99,
    stock: 50,
    category: 'electronics'
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt in multiple colors.',
    price: 24.99,
    stock: 100,
    category: 'clothing'
  },
  {
    name: 'JavaScript Programming Book',
    description: 'Complete guide to modern JavaScript programming with practical examples.',
    price: 39.99,
    stock: 75,
    category: 'books'
  },
  {
    name: 'Smart LED Bulbs (4-Pack)',
    description: 'WiFi-enabled smart LED bulbs with color changing and voice control.',
    price: 49.99,
    stock: 30,
    category: 'home'
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat made from eco-friendly materials with carrying strap.',
    price: 34.99,
    stock: 60,
    category: 'sports'
  },
  {
    name: 'Natural Face Moisturizer',
    description: 'Organic face moisturizer with hyaluronic acid. Suitable for all skin types.',
    price: 28.99,
    stock: 40,
    category: 'beauty'
  }
];

async function setupAdminAndProducts() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('ecommerce');
    console.log('✅ Connected to MongoDB');
    
    // Create admin user
    console.log('👤 Setting up admin user...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ email: 'admin@skillbridge.com' });
    
    let adminId;
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists, updating role...');
      await db.collection('users').updateOne(
        { email: 'admin@skillbridge.com' },
        { $set: { role: 'admin' } }
      );
      adminId = existingAdmin._id;
      console.log('✅ Admin role updated');
    } else {
      // Try to create new admin user
      try {
        const adminUser = {
          username: 'admin',
          email: 'admin@skillbridge.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          createdAt: new Date()
        };
        
        const result = await db.collection('users').insertOne(adminUser);
        adminId = result.insertedId;
        console.log('✅ Admin user created');
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error, find existing user and update role
          console.log('ℹ️ Admin username exists, finding and updating...');
          const existingUser = await db.collection('users').findOne({ username: 'admin' });
          if (existingUser) {
            await db.collection('users').updateOne(
              { _id: existingUser._id },
              { $set: { role: 'admin', email: 'admin@skillbridge.com' } }
            );
            adminId = existingUser._id;
            console.log('✅ Existing admin user updated');
          }
        } else {
          throw error;
        }
      }
    }
    
    // Clear existing products
    console.log('🗑️ Clearing existing products...');
    await db.collection('products').deleteMany({});
    
    // Create products
    console.log('📦 Creating sample products...');
    const productsWithUserId = sampleProducts.map(product => ({
      ...product,
      userId: adminId.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const result = await db.collection('products').insertMany(productsWithUserId);
    console.log(`✅ Created ${result.insertedCount} products`);
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n🔑 Admin Credentials:');
    console.log('Email: admin@skillbridge.com');
    console.log('Password: Admin123!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open frontend: http://localhost:3001');
    console.log('2. Login with admin credentials');
    console.log('3. Access Admin Dashboard via "Admin" button');
    console.log('4. Manage products and view orders');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('👋 Disconnected from MongoDB');
    }
  }
}

setupAdminAndProducts();