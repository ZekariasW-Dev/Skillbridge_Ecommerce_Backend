const axios = require('axios');

const API_BASE_URL = 'https://skillbridge-ecommerce-backend-3.onrender.com';

async function testAdminFunctionality() {
  console.log('🧪 Testing Admin Functionality...\n');
  
  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
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
      console.log('⚠️ User is not admin yet. Please update role in MongoDB Atlas first.');
      console.log('📋 Follow the steps in ADMIN_SETUP_GUIDE.md');
      return;
    }

    // Step 2: Test product creation
    console.log('\n2️⃣ Testing product creation...');
    const testProduct = {
      name: 'Test Product - Admin Created',
      description: 'This is a test product created by the admin to verify functionality.',
      price: 29.99,
      stock: 100,
      category: 'electronics'
    };

    const createResponse = await axios.post(`${API_BASE_URL}/products`, testProduct, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (createResponse.data.success) {
      console.log('✅ Product created successfully!');
      console.log(`📦 Product ID: ${createResponse.data.object._id}`);
      console.log(`📝 Product Name: ${createResponse.data.object.name}`);
      
      // Step 3: Test product retrieval
      console.log('\n3️⃣ Testing product retrieval...');
      const getResponse = await axios.get(`${API_BASE_URL}/products`);
      
      if (getResponse.data.success) {
        const products = getResponse.data.products || [];
        console.log(`✅ Retrieved ${products.length} products`);
        
        const testProductFound = products.find(p => p._id === createResponse.data.object._id);
        if (testProductFound) {
          console.log('✅ Test product found in product list');
        }
      }

      // Step 4: Test product update
      console.log('\n4️⃣ Testing product update...');
      const updateData = {
        ...testProduct,
        name: 'Test Product - Updated by Admin',
        price: 39.99
      };

      const updateResponse = await axios.put(
        `${API_BASE_URL}/products/${createResponse.data.object._id}`, 
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (updateResponse.data.success) {
        console.log('✅ Product updated successfully!');
        console.log(`📝 New Name: ${updateResponse.data.object.name}`);
        console.log(`💰 New Price: $${updateResponse.data.object.price}`);
      }

      // Step 5: Test product deletion
      console.log('\n5️⃣ Testing product deletion...');
      const deleteResponse = await axios.delete(
        `${API_BASE_URL}/products/${createResponse.data.object._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (deleteResponse.data.success) {
        console.log('✅ Product deleted successfully!');
      }

    } else {
      console.log('❌ Product creation failed');
    }

    console.log('\n🎉 All admin functionality tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open frontend: http://localhost:3001');
    console.log('2. Login with admin credentials');
    console.log('3. Navigate to Admin Dashboard (/admin)');
    console.log('4. Start adding products using the UI');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📄 Response:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n💡 This might be because:');
        console.log('1. User role is not "admin" in MongoDB');
        console.log('2. Token is invalid or expired');
        console.log('3. Authentication middleware is blocking the request');
      }
    }
  }
}

// Run the test
testAdminFunctionality();