const axios = require('axios');

// Your backend API URL
const API_BASE_URL = 'https://skillbridge-ecommerce-backend-3.onrender.com';

// Sample products data with various categories
const sampleProducts = [
  // Electronics
  {
    name: "iPhone 15 Pro Max",
    description: "Latest Apple iPhone with A17 Pro chip, titanium design, and advanced camera system. Features 6.7-inch Super Retina XDR display.",
    price: 1199.99,
    category: "electronics",
    stock: 25
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android smartphone with S Pen, 200MP camera, and AI-powered features. 6.8-inch Dynamic AMOLED display.",
    price: 1299.99,
    category: "electronics",
    stock: 30
  },
  {
    name: "MacBook Air M3",
    description: "Ultra-thin laptop with Apple M3 chip, 13.6-inch Liquid Retina display, and all-day battery life. Perfect for work and creativity.",
    price: 1099.99,
    category: "electronics",
    stock: 15
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Industry-leading noise canceling wireless headphones with 30-hour battery life and premium sound quality.",
    price: 399.99,
    category: "electronics",
    stock: 40
  },
  {
    name: "iPad Pro 12.9-inch",
    description: "Most advanced iPad with M2 chip, Liquid Retina XDR display, and support for Apple Pencil and Magic Keyboard.",
    price: 1099.99,
    category: "electronics",
    stock: 20
  },

  // Clothing
  {
    name: "Nike Air Force 1 Sneakers",
    description: "Classic white leather sneakers with iconic design. Comfortable and versatile for everyday wear.",
    price: 90.00,
    category: "clothing",
    stock: 50
  },
  {
    name: "Levi's 501 Original Jeans",
    description: "The original blue jeans since 1873. Classic straight fit with button fly and authentic details.",
    price: 69.99,
    category: "clothing",
    stock: 75
  },
  {
    name: "Adidas Ultraboost 22 Running Shoes",
    description: "High-performance running shoes with responsive Boost midsole and Primeknit upper for ultimate comfort.",
    price: 180.00,
    category: "clothing",
    stock: 35
  },
  {
    name: "Champion Reverse Weave Hoodie",
    description: "Premium heavyweight hoodie with reverse weave construction. Soft, durable, and perfect for layering.",
    price: 65.00,
    category: "clothing",
    stock: 60
  },
  {
    name: "Ray-Ban Aviator Sunglasses",
    description: "Iconic aviator sunglasses with gold frame and green lenses. Timeless style and 100% UV protection.",
    price: 154.00,
    category: "clothing",
    stock: 45
  },

  // Books
  {
    name: "The Psychology of Money",
    description: "Timeless lessons on wealth, greed, and happiness by Morgan Housel. A must-read for understanding financial behavior.",
    price: 16.99,
    category: "books",
    stock: 100
  },
  {
    name: "Atomic Habits",
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear. Transform your life with tiny changes.",
    price: 18.99,
    category: "books",
    stock: 85
  },
  {
    name: "The 7 Habits of Highly Effective People",
    description: "Stephen Covey's classic guide to personal and professional effectiveness. Principles for success and fulfillment.",
    price: 15.99,
    category: "books",
    stock: 70
  },
  {
    name: "Think and Grow Rich",
    description: "Napoleon Hill's timeless classic on achieving success and wealth through positive thinking and goal setting.",
    price: 14.99,
    category: "books",
    stock: 90
  },
  {
    name: "The Lean Startup",
    description: "Eric Ries' revolutionary approach to building successful startups through validated learning and innovation.",
    price: 17.99,
    category: "books",
    stock: 65
  },

  // Home & Garden
  {
    name: "Instant Pot Duo 7-in-1",
    description: "Multi-functional electric pressure cooker that replaces 7 kitchen appliances. Perfect for quick, healthy meals.",
    price: 79.99,
    category: "home",
    stock: 30
  },
  {
    name: "Dyson V15 Detect Vacuum",
    description: "Cordless vacuum with laser dust detection and powerful suction. Advanced filtration captures 99.99% of particles.",
    price: 749.99,
    category: "home",
    stock: 15
  },
  {
    name: "KitchenAid Stand Mixer",
    description: "Professional-grade stand mixer with 5-quart bowl. Perfect for baking, mixing, and food preparation.",
    price: 379.99,
    category: "home",
    stock: 25
  },
  {
    name: "Philips Hue Smart Bulbs (4-Pack)",
    description: "Color-changing smart LED bulbs controlled by smartphone app. Create the perfect ambiance for any occasion.",
    price: 199.99,
    category: "home",
    stock: 40
  },
  {
    name: "Ninja Foodi Indoor Grill",
    description: "Indoor grill and air fryer combo. Achieve outdoor grilling flavors indoors with smokeless technology.",
    price: 229.99,
    category: "home",
    stock: 20
  },

  // Sports & Fitness
  {
    name: "Peloton Bike+",
    description: "Premium indoor cycling bike with rotating HD touchscreen and access to live and on-demand classes.",
    price: 2495.00,
    category: "sports",
    stock: 8
  },
  {
    name: "Bowflex SelectTech Dumbbells",
    description: "Adjustable dumbbells that replace 15 sets of weights. Space-saving design for home gym workouts.",
    price: 549.99,
    category: "sports",
    stock: 12
  },
  {
    name: "Yeti Rambler Tumbler",
    description: "Insulated stainless steel tumbler that keeps drinks cold for hours. Perfect for outdoor adventures.",
    price: 35.00,
    category: "sports",
    stock: 80
  },
  {
    name: "Fitbit Charge 5",
    description: "Advanced fitness tracker with built-in GPS, heart rate monitoring, and 6+ day battery life.",
    price: 179.99,
    category: "sports",
    stock: 55
  },
  {
    name: "Wilson Evolution Basketball",
    description: "Official size basketball with composite leather cover. Preferred by high school and college players.",
    price: 64.99,
    category: "sports",
    stock: 35
  },

  // Beauty & Personal Care
  {
    name: "Fenty Beauty Foundation",
    description: "Long-wear, buildable foundation with medium to full coverage. Available in 50 diverse shades.",
    price: 36.00,
    category: "beauty",
    stock: 60
  },
  {
    name: "The Ordinary Niacinamide Serum",
    description: "High-strength vitamin and zinc serum that reduces appearance of skin blemishes and congestion.",
    price: 7.90,
    category: "beauty",
    stock: 120
  },
  {
    name: "Dyson Airwrap Hair Styler",
    description: "Multi-styler that curls, waves, and smooths hair using controlled airflow. No extreme heat damage.",
    price: 599.99,
    category: "beauty",
    stock: 18
  },
  {
    name: "Charlotte Tilbury Lipstick",
    description: "Matte revolution lipstick with 3D glowing pigments and cashmere finish. Long-lasting color.",
    price: 37.00,
    category: "beauty",
    stock: 45
  },
  {
    name: "CeraVe Moisturizing Cream",
    description: "Daily face and body moisturizer with hyaluronic acid and ceramides. Suitable for dry to very dry skin.",
    price: 16.99,
    category: "beauty",
    stock: 90
  },

  // Toys & Games
  {
    name: "LEGO Creator Expert Taj Mahal",
    description: "Detailed architectural model with over 2000 pieces. Perfect for adult LEGO enthusiasts and display.",
    price: 369.99,
    category: "toys",
    stock: 15
  },
  {
    name: "Nintendo Switch OLED",
    description: "Handheld gaming console with vibrant OLED screen and enhanced audio. Play at home or on the go.",
    price: 349.99,
    category: "toys",
    stock: 25
  },
  {
    name: "Monopoly Classic Board Game",
    description: "The classic property trading game that brings families together. Buy, sell, and trade your way to victory.",
    price: 19.99,
    category: "toys",
    stock: 70
  },
  {
    name: "Rubik's Cube 3x3",
    description: "The original 3x3 color-matching puzzle that has challenged minds for generations. Smooth turning action.",
    price: 9.99,
    category: "toys",
    stock: 100
  },
  {
    name: "Hot Wheels Track Builder Set",
    description: "Motorized track set with loops, curves, and launchers. Includes 1 Hot Wheels vehicle.",
    price: 49.99,
    category: "toys",
    stock: 40
  },

  // Food & Beverages
  {
    name: "Blue Bottle Coffee Beans",
    description: "Single-origin coffee beans roasted to perfection. Rich, complex flavor with notes of chocolate and fruit.",
    price: 22.00,
    category: "food",
    stock: 50
  },
  {
    name: "Ghirardelli Dark Chocolate Squares",
    description: "Premium dark chocolate squares with 60% cacao. Rich, intense flavor in convenient individual squares.",
    price: 12.99,
    category: "food",
    stock: 75
  },
  {
    name: "Honey Nut Cheerios Cereal",
    description: "Heart-healthy whole grain cereal with real honey and natural almond flavor. Great for breakfast.",
    price: 4.99,
    category: "food",
    stock: 120
  },
  {
    name: "Organic Green Tea",
    description: "Premium organic green tea leaves with antioxidants. Smooth, refreshing taste with health benefits.",
    price: 18.99,
    category: "food",
    stock: 60
  },
  {
    name: "Artisanal Pasta Sauce",
    description: "Handcrafted marinara sauce made with San Marzano tomatoes, fresh basil, and extra virgin olive oil.",
    price: 8.99,
    category: "food",
    stock: 85
  }
];

async function populateProducts() {
  console.log('🚀 Starting to populate products...');
  
  try {
    // First, let's create an admin user to add products
    console.log('📝 Creating admin user...');
    
    const adminUser = {
      username: 'admin',
      email: 'admin@skillbridge.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    };

    let adminToken;
    
    try {
      // Try to register admin user
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, adminUser);
      console.log('✅ Admin user created successfully');
      
    } catch (error) {
      if (error.response?.status === 409 || error.response?.status === 400) {
        console.log('ℹ️ Admin user already exists, continuing...');
      } else {
        console.error('Registration error:', error.response?.data || error.message);
        throw error;
      }
    }

    // Login to get token
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: adminUser.email,
        password: adminUser.password
      });
      
      console.log('Login response:', loginResponse.data);
      adminToken = loginResponse.data.object?.token || loginResponse.data.data?.token || loginResponse.data.token;
      
      if (!adminToken) {
        throw new Error('No token received from login');
      }
      
      console.log('✅ Admin logged in successfully');
      
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }

    // Now add products
    console.log('🛍️ Adding products to database...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < sampleProducts.length; i++) {
      const product = sampleProducts[i];
      
      try {
        const response = await axios.post(`${API_BASE_URL}/products`, product, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        successCount++;
        console.log(`✅ Added: ${product.name} (${successCount}/${sampleProducts.length})`);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errorCount++;
        console.log(`❌ Failed to add: ${product.name} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n🎉 Product population completed!');
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Failed to add: ${errorCount} products`);
    console.log(`📊 Total products in database: ${successCount}`);
    
    console.log('\n🔗 Your backend now has products!');
    console.log('🌐 Backend URL: https://skillbridge-ecommerce-backend-3.onrender.com');
    console.log('👤 Admin credentials:');
    console.log('   Email: admin@skillbridge.com');
    console.log('   Password: Admin123!');
    
  } catch (error) {
    console.error('❌ Error populating products:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the script
populateProducts();