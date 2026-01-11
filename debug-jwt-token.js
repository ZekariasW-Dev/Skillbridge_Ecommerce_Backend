const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function debugJWTToken() {
  console.log('🧪 Debugging JWT Token...\n');

  try {
    // Login and get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@skillbridge.com',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.object.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 50) + '...');

    // Decode token to see its contents
    console.log('\n2. Decoding JWT token...');
    const decoded = jwt.decode(token);
    console.log('Decoded token payload:', JSON.stringify(decoded, null, 2));

    // Check what the auth middleware would extract
    console.log('\n3. What auth middleware sees:');
    console.log('- decoded.userId:', decoded.userId);
    console.log('- decoded.UserId:', decoded.UserId);
    console.log('- decoded.username:', decoded.username);
    console.log('- decoded.role:', decoded.role);

    console.log('\n🎉 JWT token debug completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

debugJWTToken();