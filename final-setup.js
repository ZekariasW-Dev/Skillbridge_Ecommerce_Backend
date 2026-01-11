const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb+srv://zekarias:zack%40123@cluster0.j4lbgu9.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

const sampleProducts = [
  {
    name: 'MacBook Pro 16"',
    description: 'Apple MacBook Pro 16-inch with M2 Pro chip, 16GB RAM, 512GB SSD. Perfect for developers and creative professionals.',
    price: 2499.99,
    stock: 15,
    category: 'electronics'
  },
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality.',
    price: 299.99,
    stock: 45,
    category: 'electronics'
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt available in multiple colors. Sustainable and ethically made.',
    price: 29.99,
    stock: 100,
    category: 'clothing'
  },
  {
    name: 'JavaScript: The Definitive Guide',
    description: 'Comprehensive guide to JavaScript programming. Covers ES2022 features, best practices, and advanced concepts.',
    price: 59.99,
    stock: 75,
    category: 'books'
  },
  {
    name: 'Smart Home Security Camera',
    description: '4K wireless security camera with night vision, motion detection, and smartphone app integration.',
    price: 199.99,
    stock: 30,
    category: 'home'
  },
  {
    name: 'Professional Yoga Mat',
    description: 'Premium non-slip yoga mat made from eco-friendly materials. Includes carrying strap and alignment guides.',
    price: 79.99,
    stock: 60,
    category: 'sports'
  },
  {
    name: 'Natural Skincare Set',
    description: 'Complete skincare routine with organic ingredients. Includes cleanser, toner, serum, and moisturizer.',
    price: 149.99,
    stock: 25,
    category: 'beauty'
  },
  {
    name: 'Educational STEM Building Kit',
    description: 'Interactive building kit that teaches engineering and programming concepts. Suitable for ages 8+.',
    price: 89.99,
    stock: 40,
    category: 'toys'
  },
  {
    name: 'Organic Honey Collection',
    description: 'Premium organic honey collection from local beekeepers. Includes wildflower, clover, and orange blossom varieties.',
    price: 34.99,
    stock: 80,
    category: 'food'
  },
  {
    name: 'Bluetooth Mechanical Keyboard',
    description: 'Wireless mechanical keyboard with RGB backlighting, programmable keys, and long battery life.',
    price: 159.99,
    stock: 35,
    category: 'electronics'
  }
];

async function finalSetup() {
  let client;
  
  try {
    console.log('🚀 Final E-commerce Platform Setup');
    console.log('=====================================\n');
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('ecommerce');
    console.log('✅ Connected to MongoDB successfully\n');
    
    // Create indexes for performance
    console.log('📊 Creating database indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('products').createIndex({ name: 1 });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    console.log('✅ Database indexes created\n');
    
    // Setup admin user
    console.log('👤 Setting up admin user...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const existingAdmin = await db.collection('users').findOne({ 
      $or: [
        { email: 'admin@skillbridge.com' },
        { username: 'admin' }
      ]
    });
    
    let adminId;
    if (existingAdmin) {
      console.log('ℹ️ Admin user exists, updating to ensure admin role...');
      await db.collection('users').updateOne(
        { _id: existingAdmin._id },
        { 
          $set: { 
            role: 'admin',
            email: 'admin@skillbridge.com',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            updatedAt: new Date()
          } 
        }
      );
      adminId = existingAdmin._id;
      console.log('✅ Admin user updated');
    } else {
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
    }
    
    // Setup sample products
    console.log('\n📦 Setting up sample products...');
    
    // Clear existing products
    const deleteResult = await db.collection('products').deleteMany({});
    console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing products`);
    
    // Create new products
    const productsWithUserId = sampleProducts.map(product => ({
      ...product,
      userId: adminId.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const insertResult = await db.collection('products').insertMany(productsWithUserId);
    console.log(`✅ Created ${insertResult.insertedCount} sample products`);
    
    // Create sample user for testing
    console.log('\n👥 Creating sample user...');
    const sampleUserPassword = await bcrypt.hash('User123!', 10);
    
    const existingUser = await db.collection('users').findOne({ email: 'user@example.com' });
    if (!existingUser) {
      const sampleUser = {
        username: 'sampleuser',
        email: 'user@example.com',
        password: sampleUserPassword,
        firstName: 'Sample',
        lastName: 'User',
        role: 'user',
        createdAt: new Date()
      };
      
      await db.collection('users').insertOne(sampleUser);
      console.log('✅ Sample user created');
    } else {
      console.log('ℹ️ Sample user already exists');
    }
    
    // Verify setup
    console.log('\n🔍 Verifying setup...');
    const userCount = await db.collection('users').countDocuments();
    const productCount = await db.collection('products').countDocuments();
    const adminUser = await db.collection('users').findOne({ email: 'admin@skillbridge.com' });
    
    console.log(`📊 Users in database: ${userCount}`);
    console.log(`📦 Products in database: ${productCount}`);
    console.log(`👤 Admin role: ${adminUser?.role}`);
    
    if (adminUser?.role === 'admin' && productCount >= 10) {
      console.log('✅ Setup verification passed');
    } else {
      console.log('⚠️ Setup verification issues detected');
    }
    
    console.log('\n🎉 Final Setup Completed Successfully!');
    console.log('=====================================');
    
    console.log('\n🔑 Admin Credentials:');
    console.log('Email: admin@skillbridge.com');
    console.log('Password: Admin123!');
    
    console.log('\n👤 Sample User Credentials:');
    console.log('Email: user@example.com');
    console.log('Password: User123!');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Start backend: npm start');
    console.log('2. Start frontend: cd frontend && npm run dev');
    console.log('3. Test API: node test-all-user-stories.js');
    console.log('4. Access frontend: http://localhost:3001');
    console.log('5. Login as admin to manage products');
    
    console.log('\n🌐 API Endpoints:');
    console.log('- Health: GET /health');
    console.log('- Register: POST /auth/register');
    console.log('- Login: POST /auth/login');
    console.log('- Products: GET /products');
    console.log('- Create Product: POST /products (Admin)');
    console.log('- Orders: GET /orders (Authenticated)');
    console.log('- Place Order: POST /orders (Authenticated)');
    
    console.log('\n📚 Features Available:');
    console.log('✅ User registration and authentication');
    console.log('✅ Admin role management');
    console.log('✅ Product CRUD operations');
    console.log('✅ Order management with transactions');
    console.log('✅ Search and pagination');
    console.log('✅ Input validation and error handling');
    console.log('✅ Rate limiting and caching');
    console.log('✅ Professional frontend UI');
    console.log('✅ Shopping cart functionality');
    console.log('✅ Admin dashboard');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('\n👋 Disconnected from MongoDB');
    }
  }
}

finalSetup();