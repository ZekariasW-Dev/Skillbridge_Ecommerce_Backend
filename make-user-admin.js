const axios = require('axios');

// Your backend API URL
const API_BASE_URL = 'https://skillbridge-ecommerce-backend-3.onrender.com';

async function makeUserAdmin() {
  console.log('🔧 Attempting to make user admin...');
  
  try {
    // Login as the user first
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
    console.log('👤 Current user role:', user.role);

    if (user.role === 'admin') {
      console.log('✅ User is already an admin!');
      console.log('\n🎯 ADMIN CREDENTIALS:');
      console.log('📧 Email: admin@skillbridge.com');
      console.log('🔒 Password: Admin123!');
      console.log('\n✅ You can now:');
      console.log('1. Login with these credentials');
      console.log('2. Access the Admin Dashboard at /admin');
      console.log('3. Add, edit, and delete products');
      return;
    }

    // Try to update role via API (this might not work if the endpoint doesn't exist)
    try {
      const updateResponse = await axios.patch(`${API_BASE_URL}/users/${user.id}/role`, 
        { role: 'admin' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ User role updated to admin successfully!');
    } catch (error) {
      console.log('⚠️ API role update not available. Manual MongoDB update required.');
      console.log('\n🔧 MANUAL MONGODB UPDATE REQUIRED:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Navigate to your cluster > Browse Collections');
      console.log('3. Find the "users" collection');
      console.log(`4. Find user with email: admin@skillbridge.com`);
      console.log(`5. Find user with ID: ${user.id}`);
      console.log('6. Edit the document and change "role": "user" to "role": "admin"');
      console.log('7. Save the changes');
    }

    console.log('\n🎯 ADMIN CREDENTIALS:');
    console.log('📧 Email: admin@skillbridge.com');
    console.log('🔒 Password: Admin123!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the script
makeUserAdmin();