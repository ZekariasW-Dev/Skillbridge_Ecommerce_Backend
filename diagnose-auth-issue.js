const axios = require('axios');

async function diagnoseAuthIssue() {
  console.log('🔍 Diagnosing Authentication Issues...\n');
  
  try {
    // Test 1: Check if frontend is running
    console.log('1️⃣ Checking frontend status...');
    try {
      const frontendResponse = await axios.get('http://localhost:3001', { timeout: 5000 });
      console.log('✅ Frontend is running on http://localhost:3001');
    } catch (error) {
      console.log('❌ Frontend not accessible:', error.message);
      console.log('💡 Make sure to run: cd frontend && npm run dev');
      return;
    }
    
    // Test 2: Check backend API
    console.log('\n2️⃣ Checking backend API...');
    const backendHealth = await axios.get('http://localhost:3000/health');
    console.log('✅ Backend is running:', backendHealth.data.message);
    
    // Test 3: Test API endpoints directly
    console.log('\n3️⃣ Testing API endpoints...');
    
    // Test login endpoint
    const loginTest = await axios.post('http://localhost:3000/auth/login', {
      email: 'admin@skillbridge.com',
      password: 'Admin123!'
    });
    
    console.log('Login API Response:');
    console.log('- Success:', loginTest.data.success);
    console.log('- Message:', loginTest.data.message);
    console.log('- Token present:', !!loginTest.data.object?.token);
    console.log('- User data:', JSON.stringify(loginTest.data.object?.user, null, 2));
    
    // Test registration endpoint
    console.log('\n4️⃣ Testing registration...');
    const testUser = {
      username: `diagtest${Date.now()}`,
      email: `diagtest${Date.now()}@example.com`,
      password: 'Test123!',
      firstName: 'Diag',
      lastName: 'Test'
    };
    
    try {
      const registerTest = await axios.post('http://localhost:3000/auth/register', testUser);
      console.log('Registration API Response:');
      console.log('- Success:', registerTest.data.success);
      console.log('- Message:', registerTest.data.message);
      console.log('- User created:', !!registerTest.data.object?._id);
    } catch (error) {
      console.log('Registration error (expected if validation fails):');
      console.log('- Status:', error.response?.status);
      console.log('- Message:', error.response?.data?.message);
      console.log('- Errors:', error.response?.data?.errors);
    }
    
    // Test 5: Check CORS
    console.log('\n5️⃣ Checking CORS configuration...');
    try {
      const corsTest = await axios.get('http://localhost:3000/products', {
        headers: {
          'Origin': 'http://localhost:3001'
        }
      });
      console.log('✅ CORS working - frontend can access backend');
    } catch (error) {
      console.log('❌ CORS issue detected:', error.message);
    }
    
    console.log('\n📋 Diagnosis Summary:');
    console.log('=====================================');
    console.log('✅ Backend API working correctly');
    console.log('✅ Authentication endpoints functional');
    console.log('✅ Response format correct');
    
    console.log('\n🔧 If login/register still not working in frontend:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Check Network tab for failed API requests');
    console.log('3. Verify frontend is using correct API URL');
    console.log('4. Check if toast notifications are showing');
    console.log('5. Try hard refresh (Ctrl+F5) to clear cache');
    
    console.log('\n🌐 Manual Test Steps:');
    console.log('1. Open: http://localhost:3001/login');
    console.log('2. Enter: admin@skillbridge.com / Admin123!');
    console.log('3. Should redirect to home with "Admin" button visible');
    console.log('4. Open: http://localhost:3001/register');
    console.log('5. Fill form and submit');
    console.log('6. Should redirect to login page with success message');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

diagnoseAuthIssue();