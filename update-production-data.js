const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const axios = require('axios');

const MONGODB_URI = 'mongodb+srv://zekarias:zack%40123@cluster0.j4lbgu9.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

// Sample products with real images for production
const productTemplates = [
  {
    name: 'iPhone 15 Pro Max',
    description: 'Latest iPhone with titanium design, A17 Pro chip, and advanced camera system. Features 6.7-inch Super Retina XDR display with ProMotion technology.',
    price: 1199.99,
    stock: 25,
    category: 'electronics',
    images: {
      primary: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
      gallery: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop'],
      thumbnails: {
        small: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&h=150&fit=crop',
        medium: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
        large: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop'
      }
    },
    brand: 'Apple',
    rating: { average: 4.8, count: 1247 },
    tags: ['smartphone', 'apple', 'premium', '5g']
  },
  {
    name: 'MacBook Pro 16" M3 Max',
    description: 'Most powerful MacBook Pro with M3 Max chip, 16-inch Liquid Retina XDR display, and up to 22 hours battery life.',
    price: 3999.99,
    stock: 15,
    category: 'electronics',
    images: {
      primary: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
      gallery: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop'],
      thumbnails: {
        small: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&h=150&fit=crop',
        medium: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
        large: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop'
      }
    },
    brand: 'Apple',
    rating: { average: 4.9, count: 892 },
    tags: ['laptop', 'apple', 'professional', 'm3']
  },
  {
    name: 'Nike Air Jordan 1 Retro High',
    description: 'Iconic basketball shoe with premium leather construction and classic colorway. A timeless sneaker legend.',
    price: 170.00,
    stock: 45,
    category: 'clothing',
    images: {
      primary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
      gallery: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'],
      thumbnails: {
        small: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop',
        medium: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
        large: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
      }
    },
    brand: 'Nike',
    rating: { average: 4.7, count: 2156 },
    tags: ['sneakers', 'basketball', 'retro', 'jordan']
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling headphones with exceptional sound quality, 30-hour battery life, and crystal-clear call quality.',
    price: 399.99,
    stock: 35,
    category: 'electronics',
    images: {
      primary: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      gallery: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'],
      thumbnails: {
        small: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
        medium: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
        large: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
      }
    },
    brand: 'Sony',
    rating: { average: 4.6, count: 1834 },
    tags: ['headphones', 'wireless', 'noise-canceling', 'premium']
  },
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    description: 'Most powerful cordless vacuum with laser dust detection and intelligent suction adjustment.',
    price: 749.99,
    stock: 20,
    category: 'home',
    images: {
      primary: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
      gallery: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop'],
      thumbnails: {
        small: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop',
        medium: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
        large: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop'
      }
    },
    brand: 'Dyson',
    rating: { average: 4.5, count: 967 },
    tags: ['vacuum', 'cordless', 'home', 'cleaning']
  }
];

async function updateProductionData() {
  let client;
  
  try {
    console.log('🔄 Updating Production Data...\n');
    
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('ecommerce');
    console.log('✅ Connected to MongoDB');
    
    // Update admin user
    console.log('\n👤 Updating admin user...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const adminResult = await db.collection('users').updateOne(
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
      },
      { upsert: true }
    );
    
    console.log('✅ Admin user updated');
    
    // Get admin ID
    const admin = await db.collection('users').findOne({ email: 'admin@skillbridge.com' });
    
    // Clear existing products
    console.log('\n🗑️ Clearing existing products...');
    const deleteResult = await db.collection('products').deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing products`);
    
    // Add products with images
    console.log('\n📦 Adding products with images...');
    const productsToInsert = [];
    
    // Add template products
    productTemplates.forEach(template => {
      productsToInsert.push({
        ...template,
        userId: admin._id.toString(),
        sku: `${template.brand.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        specifications: {
          Brand: template.brand,
          Category: template.category,
          'In Stock': template.stock > 0 ? 'Yes' : 'No'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    // Fetch additional products from FakeStore API
    console.log('\n🌐 Fetching additional products from API...');
    try {
      const response = await axios.get('https://fakestoreapi.com/products');
      const apiProducts = response.data;
      
      apiProducts.forEach(product => {
        productsToInsert.push({
          name: product.title,
          description: product.description,
          price: parseFloat(product.price),
          stock: Math.floor(Math.random() * 50) + 10,
          category: mapCategory(product.category),
          images: {
            primary: product.image,
            gallery: [product.image],
            thumbnails: {
              small: product.image,
              medium: product.image,
              large: product.image
            }
          },
          brand: generateBrand(product.category),
          rating: {
            average: product.rating?.rate || 4.0,
            count: product.rating?.count || Math.floor(Math.random() * 500) + 50
          },
          tags: generateTags(product.title),
          sku: `API-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          specifications: {
            Brand: generateBrand(product.category),
            Category: mapCategory(product.category),
            'Product ID': product.id
          },
          userId: admin._id.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
      
      console.log(`✅ Added ${apiProducts.length} products from API`);
    } catch (error) {
      console.log('⚠️ Could not fetch from API, using template products only');
    }
    
    // Insert all products
    const insertResult = await db.collection('products').insertMany(productsToInsert);
    console.log(`✅ Inserted ${insertResult.insertedCount} products with images`);
    
    // Create indexes
    console.log('\n📊 Creating indexes...');
    await db.collection('products').createIndex({ name: 1 });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('products').createIndex({ createdAt: -1 });
    console.log('✅ Indexes created');
    
    console.log('\n🎉 Production Data Updated Successfully!');
    console.log('=====================================');
    console.log(`✅ Admin user: admin@skillbridge.com / Admin123!`);
    console.log(`✅ Products: ${insertResult.insertedCount} with real images`);
    console.log('✅ Database indexes created');
    console.log('✅ Ready for production use');
    
  } catch (error) {
    console.error('❌ Error updating production data:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n👋 Disconnected from MongoDB');
    }
  }
}

function mapCategory(apiCategory) {
  const categoryMap = {
    "men's clothing": 'clothing',
    "women's clothing": 'clothing',
    "jewelery": 'beauty',
    "electronics": 'electronics'
  };
  return categoryMap[apiCategory] || 'electronics';
}

function generateBrand(category) {
  const brands = {
    'electronics': ['Samsung', 'Apple', 'Sony', 'LG'],
    'clothing': ['Nike', 'Adidas', 'Zara', 'H&M'],
    'beauty': ['Sephora', 'MAC', 'L\'Oreal', 'Maybelline']
  };
  
  const categoryBrands = brands[mapCategory(category)] || brands['electronics'];
  return categoryBrands[Math.floor(Math.random() * categoryBrands.length)];
}

function generateTags(title) {
  return title.toLowerCase().split(' ').slice(0, 3);
}

updateProductionData();