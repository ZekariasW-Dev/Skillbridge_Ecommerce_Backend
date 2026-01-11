const { MongoClient } = require('mongodb');
const axios = require('axios');

const MONGODB_URI = 'mongodb+srv://zekarias:zack%40123@cluster0.j4lbgu9.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

// Extended product database with multiple categories
const productTemplates = {
  electronics: [
    {
      name: 'iPhone 15 Pro Max',
      description: 'Latest iPhone with titanium design, A17 Pro chip, and advanced camera system. Features 6.7-inch Super Retina XDR display.',
      basePrice: 1199.99,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
      brand: 'Apple',
      specs: { Display: '6.7-inch Super Retina XDR', Chip: 'A17 Pro', Storage: '256GB', Camera: '48MP Pro camera system' }
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Premium Android smartphone with S Pen, 200MP camera, and AI-powered features. Built for productivity and creativity.',
      basePrice: 1299.99,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop',
      brand: 'Samsung',
      specs: { Display: '6.8-inch Dynamic AMOLED 2X', Processor: 'Snapdragon 8 Gen 3', Storage: '256GB', Camera: '200MP Quad camera' }
    },
    {
      name: 'MacBook Pro 16" M3 Max',
      description: 'Most powerful MacBook Pro with M3 Max chip, 16-inch Liquid Retina XDR display, and up to 22 hours battery life.',
      basePrice: 3999.99,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
      brand: 'Apple',
      specs: { Display: '16.2-inch Liquid Retina XDR', Chip: 'Apple M3 Max', Memory: '36GB', Storage: '1TB SSD' }
    },
    {
      name: 'Dell XPS 13 Plus',
      description: 'Ultra-thin laptop with 13.4-inch InfinityEdge display, 12th Gen Intel processors, and premium build quality.',
      basePrice: 1299.99,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
      brand: 'Dell',
      specs: { Display: '13.4-inch OLED', Processor: 'Intel Core i7-1360P', Memory: '16GB', Storage: '512GB SSD' }
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise canceling headphones with exceptional sound quality and 30-hour battery life.',
      basePrice: 399.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      brand: 'Sony',
      specs: { Driver: '30mm', 'Battery Life': '30 hours', Connectivity: 'Bluetooth 5.2', Features: 'Active Noise Canceling' }
    },
    {
      name: 'iPad Pro 12.9" M2',
      description: 'Most advanced iPad with M2 chip, 12.9-inch Liquid Retina XDR display, and support for Apple Pencil.',
      basePrice: 1099.99,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
      brand: 'Apple',
      specs: { Display: '12.9-inch Liquid Retina XDR', Chip: 'Apple M2', Storage: '128GB', Camera: '12MP Wide + 10MP Ultra Wide' }
    },
    {
      name: 'Nintendo Switch OLED',
      description: 'Enhanced Nintendo Switch with vibrant 7-inch OLED screen, improved audio, and enhanced kickstand.',
      basePrice: 349.99,
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop',
      brand: 'Nintendo',
      specs: { Display: '7-inch OLED', Storage: '64GB', 'Battery Life': '4.5-9 hours', Connectivity: 'Wi-Fi, Bluetooth' }
    },
    {
      name: 'Apple Watch Series 9',
      description: 'Most advanced Apple Watch with S9 chip, Double Tap gesture, and comprehensive health tracking.',
      basePrice: 399.99,
      image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&h=500&fit=crop',
      brand: 'Apple',
      specs: { Display: 'Always-On Retina', Chip: 'S9 SiP', 'Battery Life': '18 hours', Features: 'ECG, Blood Oxygen' }
    }
  ],
  clothing: [
    {
      name: 'Nike Air Jordan 1 Retro High',
      description: 'Iconic basketball shoe with premium leather construction and classic colorway. A timeless sneaker legend.',
      basePrice: 170.00,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
      brand: 'Nike',
      specs: { Material: 'Premium Leather', Sole: 'Rubber with Air-Sole', Style: 'High-top', Sizes: '7-13 US' }
    },
    {
      name: 'Adidas Ultraboost 22',
      description: 'Revolutionary running shoe with Boost midsole technology and Primeknit upper for ultimate comfort.',
      basePrice: 190.00,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
      brand: 'Adidas',
      specs: { Technology: 'Boost midsole', Upper: 'Primeknit', Purpose: 'Running', Sizes: '6-14 US' }
    },
    {
      name: 'Levi\'s 501 Original Jeans',
      description: 'The original blue jean since 1873. Classic straight fit with button fly and iconic styling.',
      basePrice: 89.99,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
      brand: 'Levi\'s',
      specs: { Fit: 'Straight', Material: '100% Cotton Denim', Closure: 'Button fly', Sizes: '28-40 waist' }
    },
    {
      name: 'Patagonia Better Sweater Fleece',
      description: 'Cozy fleece jacket made from recycled polyester. Perfect for outdoor adventures and everyday wear.',
      basePrice: 119.00,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop',
      brand: 'Patagonia',
      specs: { Material: 'Recycled Polyester Fleece', Features: 'Full-zip, Pockets', Sizes: 'XS-XXL', Care: 'Machine wash' }
    },
    {
      name: 'Champion Reverse Weave Hoodie',
      description: 'Classic heavyweight hoodie with reverse weave construction to resist shrinkage and maintain shape.',
      basePrice: 65.00,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
      brand: 'Champion',
      specs: { Material: 'Cotton/Polyester blend', Weight: 'Heavyweight', Features: 'Kangaroo pocket, Drawstring hood', Sizes: 'S-XXL' }
    },
    {
      name: 'Ray-Ban Aviator Classic',
      description: 'Iconic aviator sunglasses with crystal lenses and gold-tone frame. Timeless style and UV protection.',
      basePrice: 154.00,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
      brand: 'Ray-Ban',
      specs: { 'Lens Material': 'Crystal', Frame: 'Metal', 'UV Protection': '100%', Sizes: '55mm, 58mm, 62mm' }
    }
  ],
  home: [
    {
      name: 'Dyson V15 Detect Cordless Vacuum',
      description: 'Most powerful cordless vacuum with laser dust detection and intelligent suction adjustment.',
      basePrice: 749.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
      brand: 'Dyson',
      specs: { 'Suction Power': '230 AW', 'Battery Life': '60 minutes', Features: 'Laser detection, LCD screen', Weight: '3.1kg' }
    },
    {
      name: 'Nest Learning Thermostat',
      description: 'Smart thermostat that learns your schedule and programs itself to save energy automatically.',
      basePrice: 249.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
      brand: 'Google',
      specs: { Connectivity: 'Wi-Fi', Compatibility: 'Most HVAC systems', Features: 'Auto-schedule, Remote control', Display: '2.08" diameter' }
    },
    {
      name: 'KitchenAid Stand Mixer',
      description: 'Professional-grade stand mixer with 5-quart bowl and multiple attachments for all baking needs.',
      basePrice: 379.99,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
      brand: 'KitchenAid',
      specs: { Capacity: '5 quarts', Power: '325 watts', Speeds: '10 speeds', Attachments: 'Dough hook, Flat beater, Wire whip' }
    },
    {
      name: 'Philips Hue Smart Bulbs (4-Pack)',
      description: 'Color-changing smart LED bulbs with app control and voice assistant compatibility.',
      basePrice: 199.99,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
      brand: 'Philips',
      specs: { Colors: '16 million colors', Brightness: '800 lumens', Connectivity: 'Zigbee, Bluetooth', 'Life Span': '25,000 hours' }
    }
  ],
  books: [
    {
      name: 'The Psychology of Money',
      description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel. Essential reading for financial literacy.',
      basePrice: 16.99,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop',
      brand: 'Harriman House',
      specs: { Pages: '256', Format: 'Paperback', Language: 'English', ISBN: '978-0857197689' }
    },
    {
      name: 'Atomic Habits',
      description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear. Transform your life with tiny changes.',
      basePrice: 18.99,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=500&fit=crop',
      brand: 'Avery',
      specs: { Pages: '320', Format: 'Hardcover', Language: 'English', ISBN: '978-0735211292' }
    },
    {
      name: 'Clean Code',
      description: 'A Handbook of Agile Software Craftsmanship by Robert C. Martin. Essential for every programmer.',
      basePrice: 42.99,
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=500&fit=crop',
      brand: 'Prentice Hall',
      specs: { Pages: '464', Format: 'Paperback', Language: 'English', ISBN: '978-0132350884' }
    }
  ],
  sports: [
    {
      name: 'Peloton Bike+',
      description: 'Premium indoor cycling bike with rotating HD touchscreen and access to live and on-demand classes.',
      basePrice: 2495.00,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
      brand: 'Peloton',
      specs: { Display: '23.8" HD touchscreen', Resistance: 'Magnetic', Dimensions: '59" L x 23" W x 59" H', Weight: '140 lbs' }
    },
    {
      name: 'Yeti Rambler Tumbler',
      description: 'Insulated stainless steel tumbler that keeps drinks cold or hot for hours. Perfect for any adventure.',
      basePrice: 35.00,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
      brand: 'Yeti',
      specs: { Capacity: '20 oz', Material: 'Stainless Steel', Insulation: 'Double-wall vacuum', Features: 'Dishwasher safe' }
    },
    {
      name: 'Manduka PRO Yoga Mat',
      description: 'Professional-grade yoga mat with superior cushioning and grip. Lifetime guarantee included.',
      basePrice: 120.00,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop',
      brand: 'Manduka',
      specs: { Thickness: '6mm', Material: 'PVC', Dimensions: '71" x 24"', Weight: '7.5 lbs' }
    }
  ],
  beauty: [
    {
      name: 'Fenty Beauty Gloss Bomb',
      description: 'Universal lip luminizer that delivers explosive shine and comfort for all skin tones.',
      basePrice: 19.00,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop',
      brand: 'Fenty Beauty',
      specs: { Volume: '9ml', Finish: 'High shine', Features: 'Non-sticky, Vanilla scent', 'Skin Tone': 'Universal' }
    },
    {
      name: 'The Ordinary Niacinamide Serum',
      description: 'High-strength vitamin and zinc serum that reduces appearance of skin blemishes and congestion.',
      basePrice: 7.90,
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop',
      brand: 'The Ordinary',
      specs: { Volume: '30ml', 'Active Ingredient': '10% Niacinamide', 'Skin Type': 'All skin types', Usage: 'AM/PM' }
    },
    {
      name: 'Dyson Supersonic Hair Dryer',
      description: 'Intelligent heat control hair dryer that prevents extreme heat damage and protects natural shine.',
      basePrice: 429.99,
      image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop',
      brand: 'Dyson',
      specs: { Motor: 'Digital motor V9', Attachments: '5 styling attachments', Features: 'Heat shield, Magnetic attachments', Weight: '1.8 lbs' }
    }
  ]
};

async function populateManyProducts() {
  let client;
  
  try {
    console.log('🛍️ Populating Many Products with Pagination Support...\n');
    
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
    
    // Clear existing products
    console.log('\n🗑️ Clearing existing products...');
    const deleteResult = await db.collection('products').deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing products`);
    
    // Generate products for each category
    console.log('\n📦 Generating products...');
    const allProducts = [];
    let productCount = 0;
    
    for (const [category, templates] of Object.entries(productTemplates)) {
      console.log(`\n📂 Creating ${category} products...`);
      
      // Create multiple variations of each template
      for (const template of templates) {
        // Create 3-5 variations of each product
        const variations = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < variations; i++) {
          const variation = createProductVariation(template, category, admin._id.toString(), i);
          allProducts.push(variation);
          productCount++;
        }
      }
      
      console.log(`✅ Created ${templates.length * 4} ${category} products (avg)`);
    }
    
    // Add some additional random products from external API
    console.log('\n🌐 Fetching additional products from FakeStore API...');
    try {
      const response = await axios.get('https://fakestoreapi.com/products');
      const apiProducts = response.data;
      
      const transformedApiProducts = apiProducts.map(product => ({
        name: product.title,
        description: product.description,
        price: parseFloat(product.price) * (1 + Math.random() * 0.5), // Add some price variation
        stock: Math.floor(Math.random() * 100) + 10,
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
        specifications: generateSpecifications(product.category, product.title),
        rating: {
          average: (product.rating?.rate || 4.0) + (Math.random() - 0.5) * 0.4,
          count: (product.rating?.count || 100) + Math.floor(Math.random() * 500)
        },
        tags: generateTags(product.title, product.category),
        brand: generateBrand(product.category),
        sku: `API-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        weight: generateWeight(product.category),
        dimensions: generateDimensions(product.category),
        userId: admin._id.toString(),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        updatedAt: new Date()
      }));
      
      allProducts.push(...transformedApiProducts);
      console.log(`✅ Added ${transformedApiProducts.length} products from API`);
    } catch (error) {
      console.log('⚠️ Could not fetch from API, continuing with generated products');
    }
    
    // Shuffle products for better distribution
    shuffleArray(allProducts);
    
    // Insert products in batches for better performance
    console.log(`\n💾 Inserting ${allProducts.length} products in batches...`);
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < allProducts.length; i += batchSize) {
      const batch = allProducts.slice(i, i + batchSize);
      await db.collection('products').insertMany(batch);
      insertedCount += batch.length;
      console.log(`   📦 Inserted batch ${Math.ceil((i + 1) / batchSize)}: ${insertedCount}/${allProducts.length} products`);
    }
    
    // Create indexes for pagination and search
    console.log('\n📊 Creating indexes for pagination and search...');
    await db.collection('products').createIndex({ createdAt: -1 });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('products').createIndex({ 'rating.average': -1 });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ brand: 1 });
    await db.collection('products').createIndex({ stock: 1 });
    console.log('✅ Indexes created for optimal pagination performance');
    
    // Display comprehensive summary
    console.log('\n📊 Product Database Summary:');
    console.log('='.repeat(50));
    
    const stats = await db.collection('products').aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    let totalProducts = 0;
    let totalValue = 0;
    
    stats.forEach(stat => {
      totalProducts += stat.count;
      totalValue += stat.avgPrice * stat.count;
      console.log(`📂 ${stat._id.toUpperCase()}: ${stat.count} products (avg $${stat.avgPrice.toFixed(2)}, ${stat.totalStock} total stock)`);
    });
    
    console.log('='.repeat(50));
    console.log(`📦 Total Products: ${totalProducts}`);
    console.log(`💰 Estimated Total Value: $${totalValue.toFixed(2)}`);
    
    // Test pagination
    console.log('\n🔍 Testing Pagination...');
    const page1 = await db.collection('products').find({}).limit(12).toArray();
    const page2 = await db.collection('products').find({}).skip(12).limit(12).toArray();
    const page3 = await db.collection('products').find({}).skip(24).limit(12).toArray();
    
    console.log(`✅ Page 1: ${page1.length} products`);
    console.log(`✅ Page 2: ${page2.length} products`);
    console.log(`✅ Page 3: ${page3.length} products`);
    
    console.log('\n🎉 Many Products Populated Successfully!');
    console.log('=====================================');
    console.log(`✅ ${allProducts.length} products with real images`);
    console.log('✅ Multiple categories and brands');
    console.log('✅ Detailed specifications and ratings');
    console.log('✅ Optimized for pagination');
    console.log('✅ Search indexes created');
    console.log('✅ Ready for production use');
    
    console.log('\n🚀 Ready to test:');
    console.log('1. Backend: node server.js');
    console.log('2. Frontend: cd frontend && npm run dev');
    console.log('3. Browse paginated products at: http://localhost:3001/products');
    console.log('4. Test pagination with: http://localhost:3000/products?page=2&limit=12');
    
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
function createProductVariation(template, category, userId, variationIndex) {
  const variations = [
    { suffix: '', priceMultiplier: 1 },
    { suffix: ' Pro', priceMultiplier: 1.3 },
    { suffix: ' Lite', priceMultiplier: 0.7 },
    { suffix: ' Plus', priceMultiplier: 1.15 },
    { suffix: ' Max', priceMultiplier: 1.5 }
  ];
  
  const variation = variations[variationIndex] || variations[0];
  const colors = ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Red', 'Green'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return {
    name: `${template.name}${variation.suffix} - ${color}`,
    description: `${template.description} Available in ${color} color.`,
    price: parseFloat((template.basePrice * variation.priceMultiplier * (0.9 + Math.random() * 0.2)).toFixed(2)),
    stock: Math.floor(Math.random() * 100) + 5,
    category: category,
    images: {
      primary: template.image,
      gallery: [template.image],
      thumbnails: {
        small: template.image,
        medium: template.image,
        large: template.image
      }
    },
    specifications: {
      ...template.specs,
      Color: color,
      Model: `${template.name}${variation.suffix}`,
      SKU: `${template.brand.toUpperCase()}-${Date.now()}-${variationIndex}`
    },
    rating: {
      average: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
      count: Math.floor(Math.random() * 2000) + 100
    },
    tags: [
      template.brand.toLowerCase(),
      category,
      color.toLowerCase(),
      ...template.name.toLowerCase().split(' ').slice(0, 2)
    ],
    brand: template.brand,
    sku: `${template.brand.replace(/\s+/g, '').toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    weight: generateWeight(category),
    dimensions: generateDimensions(category),
    userId: userId,
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date within last 60 days
    updatedAt: new Date()
  };
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
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

populateManyProducts();