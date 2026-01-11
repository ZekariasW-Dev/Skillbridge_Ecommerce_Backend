#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up SkillBridge E-commerce Frontend...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the frontend directory');
  process.exit(1);
}

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Copy environment file
  if (!fs.existsSync('.env')) {
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      console.log('✅ Created .env file from .env.example');
    } else {
      // Create basic .env file
      const envContent = `VITE_API_BASE_URL=https://skillbridge-ecommerce-backend-3.onrender.com
VITE_APP_NAME=SkillBridge E-commerce
`;
      fs.writeFileSync('.env', envContent);
      console.log('✅ Created .env file with default values');
    }
  }

  console.log('\n🎉 Setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Review the .env file and update if needed');
  console.log('2. Run "npm run dev" to start development server');
  console.log('3. Run "npm run build" to build for production');
  console.log('4. Deploy using Vercel, Netlify, or Render');
  console.log('\n🔗 Backend API: https://skillbridge-ecommerce-backend-3.onrender.com');
  console.log('📚 Check COMPLETE_DEPLOYMENT_GUIDE.md for deployment instructions');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}