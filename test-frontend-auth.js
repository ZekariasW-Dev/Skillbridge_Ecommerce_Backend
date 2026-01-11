const puppeteer = require('puppeteer');

async function testFrontendAuth() {
  console.log('🌐 Testing Frontend Authentication...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      defaultViewport: { width: 1280, height: 720 }
    });
    
    const page = await browser.newPage();
    
    // Test 1: Navigate to login page
    console.log('1️⃣ Navigating to login page...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle0' });
    
    // Check if login form is present
    const loginForm = await page.$('form');
    if (loginForm) {
      console.log('✅ Login form found');
    } else {
      console.log('❌ Login form not found');
      return;
    }
    
    // Test 2: Try admin login
    console.log('\n2️⃣ Testing admin login...');
    await page.type('input[name="email"]', 'admin@skillbridge.com');
    await page.type('input[name="password"]', 'Admin123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation or error
    await page.waitForTimeout(3000);
    
    // Check if redirected to home page or admin dashboard
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    if (currentUrl.includes('/admin') || currentUrl === 'http://localhost:3001/') {
      console.log('✅ Admin login successful - redirected correctly');
      
      // Check if admin button is visible in navbar
      const adminButton = await page.$('button:contains("Admin")');
      if (adminButton) {
        console.log('✅ Admin button visible in navbar');
      }
    } else {
      console.log('❌ Admin login may have failed - not redirected');
    }
    
    // Test 3: Navigate to register page
    console.log('\n3️⃣ Testing registration page...');
    await page.goto('http://localhost:3001/register', { waitUntil: 'networkidle0' });
    
    const registerForm = await page.$('form');
    if (registerForm) {
      console.log('✅ Register form found');
      
      // Fill registration form
      const timestamp = Date.now();
      await page.type('input[name="firstName"]', 'Test');
      await page.type('input[name="lastName"]', 'User');
      await page.type('input[name="username"]', `testuser${timestamp}`);
      await page.type('input[name="email"]', `test${timestamp}@example.com`);
      await page.type('input[name="password"]', 'Test123!');
      await page.type('input[name="confirmPassword"]', 'Test123!');
      
      // Submit registration
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Check if redirected to login page
      const regCurrentUrl = page.url();
      console.log('Current URL after registration:', regCurrentUrl);
      
      if (regCurrentUrl.includes('/login')) {
        console.log('✅ Registration successful - redirected to login');
      } else {
        console.log('❌ Registration may have failed');
      }
    } else {
      console.log('❌ Register form not found');
    }
    
    console.log('\n🎉 Frontend Authentication Test Complete!');
    
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  testFrontendAuth();
} catch (error) {
  console.log('⚠️ Puppeteer not available for automated testing');
  console.log('📋 Manual Testing Instructions:');
  console.log('1. Open http://localhost:3001/login');
  console.log('2. Login with: admin@skillbridge.com / Admin123!');
  console.log('3. Check if redirected and "Admin" button appears');
  console.log('4. Try registering a new user at /register');
  console.log('5. Check if registration redirects to login');
}