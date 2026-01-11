const { MongoClient } = require('mongodb');
const axios = require('axios');

const MONGODB_URI = 'mongodb+srv://zekarias:zack%40123@cluster0.j4lbgu9.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

async function populateRealProducts() {
  let client;
  
  try {
    console.log('🛍️ Populating Real Products with Images...\n');
    
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('ecommerce');
    console.log('✅ Connected to MongoDB');
    
    // Get admin user ID
    const admin = await db.collection('users').findOne({ email: 'admin@skillbridge.com' });
    if (!admin) {
      throw new Error('Admin user not found. Run final-setup.js first.');
    }
    
    // Fetch products from FakeStore API
    console.log('\n📦 Fetching products from FakeStore API...');
    const response = await axios.get('https://fakestoreapi.com/products');
    const apiProducts = response.data;
    console.log(`✅ Fetched ${apiProducts.length} products from API`);
    
    // Clear existing products
    console.log('\n🗑️ Clearing existing products...');
    const deleteResult = await db.collection('products').deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing products`);
    
    // Transform API products to our format
    console.log('\n🔄 Transforming products...');
    const transformedProducts = apiProducts.map(product => ({
      name: product.title,
      description: product.description,
      price: parseFloat(product.price),
      stock: Math.floor(Math.random() * 100) + 10, // Random stock between 10-110
      category: mapCategory(product.category),
      images: {
        primary: product.image,
        gallery: [product.image], // FakeStore only provides one image
        thumbnails: {
          small: product.image,
          medium: product.image,
          large: product.image
        }
      },
      specifications: generateSpecifications(product.category, product.title),
      rating: {
        average: product.rating?.rate || 4.0,
        count: product.rating?.count || Math.floor(Math.random() * 1000) + 50
      },
      tags: generateTags(product.title, product.category),
      brand: generateBrand(product.category),
      sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      weight: generateWeight(product.category),
      dimensions: generateDimensions(product.category),
      userId: admin._id.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Add some additional custom products with better images
    const customProducts = [
      {
        name: 'iPhone 15 Pro Max',
        description: 'The most advanced iPhone ever with titanium design, A17 Pro chip, and professional camera system. Features 6.7-inch Super Retina XDR display with ProMotion technology.',
        price: 1199.99,
        stock: 25,
        category: 'electronics',
        images: {
          primary: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
          gallery: [
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop'
          ],
          thumbnails: {
            small: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&h=150&fit=crop',
            medium: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
            large: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop'
          }
        },
        specifications: {
          'Display': '6.7-inch Super Retina XDR',
          'Chip': 'A17 Pro',
          'Storage': '256GB',
          'Camera': '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
          'Battery': 'Up to 29 hours video playback',
          'OS': 'iOS 17'
        },
        rating: { average: 4.8, count: 1247 },
        tags: ['smartphone', 'apple', 'premium', 'camera', '5g'],
        brand: 'Apple',
        sku: 'APPLE-IP15PM-256',
        weight: '221g',
        dimensions: '159.9 × 76.7 × 8.25 mm',
        userId: admin._id.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MacBook Pro 16" M3 Max',
        description: 'The most powerful MacBook Pro ever with M3 Max chip, 16-inch Liquid Retina XDR display, and up to 22 hours of battery life. Perfect for professionals and creators.',
        price: 3999.99,
        stock: 15,
        category: 'electronics',
        images: {
          primary: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
          gallery: [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop'
          ],
          thumbnails: {
            small: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&h=150&fit=crop',
            medium: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
            large: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop'
          }
        },
        specifications: {
          'Display': '16.2-inch Liquid Retina XDR',
          'Chip': 'Apple M3 Max',
          'Memory': '36GB Unified Memory',
          'Storage': '1TB SSD',
          'Graphics': '40-core GPU',
          'Battery': 'Up to 22 hours',
          'Ports': '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3'
        },
        rating: { average: 4.9, count: 892 },
        tags: ['laptop', 'apple', 'professional', 'creative', 'm3'],
        brand: 'Apple',
        sku: 'APPLE-MBP16-M3MAX',
        weight: '2.14kg',
        dimensions: '35.57 × 24.81 × 1.68 cm',
        userId: admin._id.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Nike Air Jordan 1 Retro High',
        description: 'The iconic basketball shoe that started it all. Premium leather construction with classic colorway and Air-Sole unit for comfort and style.',
        price: 170.00,
        stock: 45,
        category: 'clothing',
        images: {
          primary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
          gallery: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop'
          ],
          thumbnails: {
            small: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop',
            medium: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
            large: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
          }
        },
        specifications: {
          'Material': 'Premium Leather',
          'Sole': 'Rubber with Air-Sole unit',
          'Closure': 'Lace-up',
          'Sizes': '7-13 US',
          'Colors': 'Multiple colorways available',
          'Style': 'High-top basketball shoe'
        },
        rating: { average: 4.7, count: 2156 },
        tags: ['sneakers', 'basketball', 'retro', 'jordan', 'nike'],
        brand: 'Nike',
        sku: 'NIKE-AJ1-RETRO',
        weight: '0.6kg',
        dimensions: '32 × 12 × 11 cm',
        userId: admin._id.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise canceling headphones with exceptional sound quality, 30-hour battery life, and crystal-clear call quality.',
        price: 399.99,
        stock: 35,
        category: 'electronics',
        images: {
          primary: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
          gallery: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop'
          ],
          thumbnails: {
            small: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
            medium: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
            large: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
          }
        },
        specifications: {
          'Driver': '30mm dynamic drivers',
          'Frequency Response': '4Hz-40kHz',
          'Battery Life': '30 hours with ANC',
          'Charging': 'USB-C, Quick charge 3min = 3hrs',
          'Connectivity': 'Bluetooth 5.2, NFC',
          'Weight': '250g',
          'Features': 'Active Noise Canceling, Touch controls'
        },
        rating: { average: 4.6, count: 1834 },
        tags: ['headphones', 'wireless', 'noise-canceling', 'premium', 'sony'],
        brand: 'Sony',
        sku: 'SONY-WH1000XM5',
        weight: '250g',
        dimensions: '26.4 × 19.5 × 8.0 cm',
        userId: admin._id.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Combine API products with custom products
    const allProducts = [...transformedProducts, ...customProducts];
    
    // Insert products into database
    console.log('\n💾 Inserting products into database...');
    const insertResult = await db.collection('products').insertMany(allProducts);
    console.log(`✅ Inserted ${insertResult.insertedCount} products`);
    
    // Create additional indexes for better performance
    console.log('\n📊 Creating search indexes...');
    await db.collection('products').createIndex({ name: 'text', description: 'text', tags: 'text' });
    await db.collection('products').createIndex({ 'rating.average': -1 });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('products').createIndex({ brand: 1 });
    console.log('✅ Search indexes created');
    
    // Display summary
    console.log('\n📊 Product Summary:');
    const categories = await db.collection('products').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} products`);
    });
    
    console.log('\n🎉 Real Products Populated Successfully!');
    console.log('=====================================');
    console.log(`✅ Total products: ${allProducts.length}`);
    console.log('✅ High-quality images from Unsplash');
    console.log('✅ Detailed product specifications');
    console.log('✅ Realistic pricing and ratings');
    console.log('✅ Product tags and categories');
    console.log('✅ Brand information');
    console.log('✅ Search indexes created');
    
    console.log('\n🚀 Ready to use:');
    console.log('1. Start backend: node server.js');
    console.log('2. Start frontend: cd frontend && npm run dev');
    console.log('3. Browse products with real images!');
    
  } catch (error) {
    console.error('❌ Error populating products:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n👋 Disconnected from MongoDB');
    }
  }
}

// Helper functions
function mapCategory(apiCategory) {
  const categoryMap = {
    "men's clothing": 'clothing',
    "women's clothing": 'clothing',
    "jewelery": 'beauty',
    "electronics": 'electronics'
  };
  return categoryMap[apiCategory] || 'electronics';
}

function generateSpecifications(category, title) {
  const specs = {};
  
  if (category === 'electronics') {
    specs['Brand'] = generateBrand(category);
    specs['Model'] = title.split(' ').slice(0, 2).join(' ');
    specs['Warranty'] = '1 Year';
    specs['Color'] = 'Multiple options available';
  } else if (category.includes('clothing')) {
    specs['Material'] = 'Premium Quality';
    specs['Care Instructions'] = 'Machine wash cold';
    specs['Fit'] = 'Regular fit';
    specs['Sizes'] = 'XS-XXL available';
  } else if (category === 'jewelery') {
    specs['Material'] = 'High-quality metal';
    specs['Finish'] = 'Polished';
    specs['Care'] = 'Clean with soft cloth';
  }
  
  return specs;
}

function generateTags(title, category) {
  const commonTags = title.toLowerCase().split(' ').slice(0, 3);
  const categoryTags = {
    'electronics': ['tech', 'gadget', 'digital'],
    'clothing': ['fashion', 'style', 'apparel'],
    'beauty': ['accessories', 'jewelry', 'elegant']
  };
  
  return [...commonTags, ...(categoryTags[mapCategory(category)] || [])];
}

function generateBrand(category) {
  const brands = {
    'electronics': ['Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP'],
    'clothing': ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s'],
    'beauty': ['Tiffany & Co', 'Pandora', 'Swarovski', 'Cartier']
  };
  
  const categoryBrands = brands[mapCategory(category)] || brands['electronics'];
  return categoryBrands[Math.floor(Math.random() * categoryBrands.length)];
}

function generateWeight(category) {
  const weights = {
    'electronics': ['0.5kg', '1.2kg', '2.1kg', '0.8kg'],
    'clothing': ['0.3kg', '0.5kg', '0.7kg', '0.4kg'],
    'beauty': ['0.1kg', '0.2kg', '0.05kg', '0.15kg']
  };
  
  const categoryWeights = weights[mapCategory(category)] || weights['electronics'];
  return categoryWeights[Math.floor(Math.random() * categoryWeights.length)];
}

function generateDimensions(category) {
  const dimensions = {
    'electronics': ['25×15×5 cm', '30×20×8 cm', '35×25×10 cm'],
    'clothing': ['Standard sizing', 'Regular fit', 'Slim fit'],
    'beauty': ['5×3×2 cm', '8×5×3 cm', '10×7×4 cm']
  };
  
  const categoryDims = dimensions[mapCategory(category)] || dimensions['electronics'];
  return categoryDims[Math.floor(Math.random() * categoryDims.length)];
}

populateRealProducts();