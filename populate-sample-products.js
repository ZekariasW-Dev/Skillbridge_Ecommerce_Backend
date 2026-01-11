const axios = require('axios');

const API_BASE_URL = 'https://skillbridge-ecommerce-backend-3.onrender.com';

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality. Perfect for music lovers and professionals.',
    price: 79.99,
    stock: 50,
    category: 'electronics'
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt. Available in multiple colors and sizes. Perfect for casual wear.',
    price: 24.99,
    stock: 100,
    category: 'clothing'
  },
  {
    name: 'JavaScript: The Complete Guide',
    description: 'Comprehensive guide to modern JavaScript programming. Covers ES6+, async programming, and best practices. Perfect for beginners and experienced developers.',
    price: 39.99,
    stock: 75,
    category: 'books'
  },
  {
    name: 'Smart Home LED Bulbs (4-Pack)',
    description: 'WiFi-enabled smart LED bulbs with color changing capabilities. Control with smartphone app or voice commands. Energy efficient and long-lasting.',
    price: 49.99,
    stock: 30,
    category: 'home'
  },
  {
    name: 'Yoga Mat - Premium Quality',
    description: 'Non-slip yoga mat made from eco-friendly materials. Extra thick for comfort and joint protection. Includes carrying strap.',
    price: 34.99,
    stock: 60,
    category: 'sports'
  },
  {
    name: 'Natural Face Moisturizer',
    description: 'Organic face moisturizer with hyaluronic acid and vitamin E. Suitable for all skin types. Cruelty-free and paraben-free.',
    price: 28.99,
    stock: 40,
    category: 'beauty'
  },
  {
    name: 'Educational Building Blocks Set',
    description: 'Creative building blocks set for children ages 3+. Promotes STEM learning and creativity. Includes 200+ colorful pieces.',
    price: 45.99,
    stock: 25,
    category: 'toys'
  },
  {
    name: 'Organic Honey - Raw & Unfiltered',
    description: 'Pure organic honey sourced from local beekeepers. Raw and unfiltered for maximum nutritional benefits. Glass jar packaging.',
    price: 18.99,
    stock: 80,
    category: 'food'
  }
];

async function populateSampleProducts() {
  console.log('🛍️ Populating Sample Products...\n');
  
  try {
    // Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@skillbridge.com',
      password: 'Admin123!'
    });

    const token = loginResponse.data.object?.token;
    const user = loginResponse.data.object?.user;

    if (!token) {
      console.error('❌ Failed to get login token');
      return;
    }

    console.log('✅ Login successful');
    console.log(`👤 User: ${user.username} (${user.role})`);

    if (user.role !== 'admin') {
      console.log('❌ User is not admin. Please update role in MongoDB Atlas first.');
      console.log('📋 Follow the steps in ADMIN_SETUP_GUIDE.md');
      return;
    }

    console.log(`\n📦 Creating ${sampleProducts.length} sample products...\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < sampleProducts.length; i++) {
      const product = sampleProducts[i];
      
      try {
        console.log(`${i + 1}. Creating "${product.name}"...`);
        
        const response = await axios.post(`${API_BASE_URL}/products`, product, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          console.log(`   ✅ Created successfully (ID: ${response.data.object._id})`);
          successCount++;
        } else {
          console.log(`   ❌ Failed to create`);
          failCount++;
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
        failCount++;
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`✅ Successfully created: ${successCount} products`);
    console.log(`❌ Failed to create: ${failCount} products`);

    if (successCount > 0) {
      console.log(`\n🎉 Sample products have been added to your store!`);
      console.log(`\n📋 Next Steps:`);
      console.log(`1. Open frontend: http://localhost:3001`);
      console.log(`2. Visit the Products page to see your new products`);
      console.log(`3. Login as admin to manage products in the Admin Dashboard`);
      console.log(`4. Test adding products to cart and placing orders`);
    }

  } catch (error) {
    console.error('❌ Error populating products:', error.message);
    if (error.response) {
      console.error('📄 Response:', error.response.data);
    }
  }
}

// Run the script
populateSampleProducts();