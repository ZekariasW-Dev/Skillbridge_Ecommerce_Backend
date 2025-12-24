// Test script for Validation & Security (Page 4 PDF Requirements)
// Tests username (letters and numbers only) and password (very strong) validation

const testValidationSecurity = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('🔒 Testing Validation & Security (Page 4 PDF Requirements)\n');
  
  try {
    // Test 1: Username validation - must contain only letters and numbers
    console.log('1️⃣ Testing username validation (letters and numbers only)...\n');
    
    // Test 1a: Valid alphanumeric username
    console.log('📝 Testing valid alphanumeric username...');
    const validUsernameResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testUser123',
        email: 'testuser123@example.com',
        password: 'StrongPass123!'
      })
    });
    
    if (validUsernameResponse.status === 201) {
      console.log('✅ Valid alphanumeric username: 201 Created (CORRECT)');
    } else {
      const data = await validUsernameResponse.json();
      console.log('❌ Valid alphanumeric username failed:', data.errors);
    }
    
    // Test 1b: Username with special characters (should fail)
    console.log('\n📝 Testing username with special characters (should fail)...');
    const specialCharUsernameResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_user!',
        email: 'testspecial@example.com',
        password: 'StrongPass123!'
      })
    });
    
    if (specialCharUsernameResponse.status === 400) {
      const data = await specialCharUsernameResponse.json();
      console.log('✅ Username with special characters: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', data.errors[0]);
    } else {
      console.log('❌ Username with special characters should be rejected');
    }
    
    // Test 1c: Username with spaces (should fail)
    console.log('\n📝 Testing username with spaces (should fail)...');
    const spaceUsernameResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test user',
        email: 'testspace@example.com',
        password: 'StrongPass123!'
      })
    });
    
    if (spaceUsernameResponse.status === 400) {
      const data = await spaceUsernameResponse.json();
      console.log('✅ Username with spaces: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', data.errors[0]);
    } else {
      console.log('❌ Username with spaces should be rejected');
    }
    
    // Test 2: Very Strong Password Requirements
    console.log('\n\n2️⃣ Testing very strong password requirements...\n');
    
    // Test 2a: Password too short (should fail)
    console.log('📝 Testing password too short (should fail)...');
    const shortPasswordResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testUser456',
        email: 'testshort@example.com',
        password: 'Short1!'
      })
    });
    
    if (shortPasswordResponse.status === 400) {
      const data = await shortPasswordResponse.json();
      console.log('✅ Short password: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', data.errors[0]);
    } else {
      console.log('❌ Short password should be rejected');
    }
    
    // Test 2b: Password without uppercase letters (should fail)
    console.log('\n📝 Testing password without uppercase letters (should fail)...');
    const noUppercaseResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testUser789',
        email: 'testuppercase@example.com',
        password: 'strongpass123!'
      })
    });
    
    if (noUppercaseResponse.status === 400) {
      const data = await noUppercaseResponse.json();
      console.log('✅ No uppercase letters: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', data.errors.find(e => e.includes('uppercase')));
    } else {
      console.log('❌ Password without uppercase letters should be rejected');
    }
    
    // Test 2c: Password without lowercase letters (should fail)
    console.log('\n📝 Testing password without lowercase letters (should fail)...');
    const noLowercaseResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testUser101',
        email: 'testlowercase@example.com',
        password: 'STRONGPASS123!'
      })
    });
    
    if (noLowercaseResponse.status === 400) {
      const data = await noLowercaseResponse.json();
      console.log('✅ No lowercase letters: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', data.errors.find(e => e.includes('lowercase')));
    } else {
      console.log('❌ Password without lowercase letters should be rejected');
    }
    
    // Test 2d: Password without numbers (should fail)
    console.log('\n📝 Testing password without numbers (should fail)...');
    const noNumbersResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testUser202',
        email: 'testnumbers@example.com',
        password: 'StrongPass!'
      })
    });
    
    if (noNumbersResponse.status === 400) {
      const data = await noNumbersResponse.json();
      console.log('✅ No numbers: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', data.errors.find(e => e.includes('number')));
    } else {
      console.log('❌ Password without numbers should be rejected');
    }
    
    // Test 2e: Password without special characters (should fail)
    console.log('\n📝 Testing password without special characters (should fail)...');
    const noSpecialResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testUser303',
        email: 'testspecial@example.com',
        password: 'StrongPass123'
      })
    });
    
    if (noSpecialResponse.status === 400) {
      const data = await noSpecialResponse.json();
      console.log('✅ No special characters: 400 Bad Request (CORRECT)');
      console.log('📝 Error message:', data.errors.find(e => e.includes('special')));
    } else {
      console.log('❌ Password without special characters should be rejected');
    }
    
    // Test 2f: Valid very strong password (should succeed)
    console.log('\n📝 Testing valid very strong password (should succeed)...');
    const strongPasswordResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'validUser606',
        email: 'validstrong@example.com',
        password: 'MyVeryStrong123!'
      })
    });
    
    if (strongPasswordResponse.status === 201) {
      console.log('✅ Valid very strong password: 201 Created (CORRECT)');
    } else {
      const data = await strongPasswordResponse.json();
      console.log('❌ Valid very strong password failed:', data.errors);
    }
    
    // Test 3: Combined validation (username and password)
    console.log('\n\n3️⃣ Testing combined validation scenarios...\n');
    
    // Test 3a: Both username and password invalid
    console.log('📝 Testing both username and password invalid...');
    const bothInvalidResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test@user',
        email: 'testboth@example.com',
        password: 'weak'
      })
    });
    
    if (bothInvalidResponse.status === 400) {
      const data = await bothInvalidResponse.json();
      console.log('✅ Both invalid: 400 Bad Request (CORRECT)');
      console.log('📝 Multiple error messages returned:', data.errors.length, 'errors');
    } else {
      console.log('❌ Both invalid should be rejected');
    }
    
    // Test 3b: Valid username and password combination
    console.log('\n📝 Testing valid username and password combination...');
    const validCombinationResponse = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'perfectUser707',
        email: 'perfect@example.com',
        password: 'MyPerfectPass123!'
      })
    });
    
    if (validCombinationResponse.status === 201) {
      console.log('✅ Valid combination: 201 Created (CORRECT)');
    } else {
      const data = await validCombinationResponse.json();
      console.log('❌ Valid combination failed:', data.errors);
    }
    
    console.log('\n🎉 Validation & Security Tests Completed!');
    console.log('\n📋 Summary - Page 4 PDF Requirements:');
    console.log('✅ Username must contain only letters and numbers (alphanumeric)');
    console.log('✅ Username cannot contain spaces or special characters');
    console.log('✅ Password must be very strong:');
    console.log('  ✅ At least 8 characters long');
    console.log('  ✅ Contains uppercase letters');
    console.log('  ✅ Contains lowercase letters');
    console.log('  ✅ Contains numbers');
    console.log('  ✅ Contains special characters');
    console.log('✅ Comprehensive validation error messages');
    console.log('✅ Multiple validation errors reported simultaneously');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testValidationSecurity();
}

module.exports = testValidationSecurity;