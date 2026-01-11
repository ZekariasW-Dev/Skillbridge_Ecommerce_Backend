const axios = require('axios');

// Your backend API URL
const API_BASE_URL = 'https://skillbridge-ecommerce-backend-3.onrender.com';

async function createAdminUser() {
  console.log('👤 Creating admin user...');
  
  try {
    // Step 1: Register a regular user first
    const adminData = {
      username: 'admin',
      email: 'admin@skillbridge.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User'
    };

    console.log('📝 Registering admin user...');
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, adminData);
      console.log('✅ Admin user registered successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Admin user already exists');
      } else {
        console.error('❌ Registration failed:', error.response?.data?.message);
        return;
      }
    }

    // Step 2: Login to get user details
    console.log('🔐 Logging in as admin...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: adminData.email,
      password: adminData.password
    });

    const token = loginResponse.data.object?.token;
    const user = loginResponse.data.object?.user;

    if (!token) {
      console.error('❌ Failed to get login token');
      return;
    }

    console.log('✅ Login successful');
    console.log('👤 User ID:', user.id);
    console.log('🔑 Token received');

    // Step 3: Instructions for manual admin role assignment
    console.log('\n🔧 MANUAL ADMIN SETUP REQUIRED:');
    console.log('Since the registration API doesn\'t allow role assignment, you need to manually update the user role in MongoDB Atlas:');
    console.log('\n📋 STEPS:');
    console.log('1. Go to https://cloud.mongodb.com/');
    console.log('2. Navigate to your cluster > Browse Collections');
    console.log('3. Find the "users" collection');
    console.log(`4. Find the user with email: ${adminData.email}`);
    console.log('5. Edit the document and change "role": "user" to "role": "admin"');
    console.log('6. Save the changes');
    
    console.log('\n🎯 ADMIN CREDENTIALS:');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔒 Password: ${adminData.password}`);
    console.log(`🆔 User ID: ${user.id}`);

    console.log('\n✅ After updating the role in MongoDB, you can:');
    console.log('1. Login with the admin credentials');
    console.log('2. Access the Admin Dashboard');
    console.log('3. Add, edit, and delete products');
    console.log('4. Manage orders and users');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the script
createAdminUser();