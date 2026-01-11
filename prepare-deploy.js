#!/usr/bin/env node

console.log('🚀 Preparing for Global Deployment...\n');

const fs = require('fs');
const path = require('path');

// 1. Check if we're ready to deploy
console.log('1. Checking deployment readiness...');

const requiredFiles = [
  'package.json',
  'server.js',
  'app.js',
  '.env',
  'frontend/package.json',
  'frontend/src/main.jsx'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check your project structure.');
  process.exit(1);
}

// 2. Create production environment files
console.log('\n2. Creating production configuration...');

// Backend production env
const backendEnv = `NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://zekarias:zack%40123@cluster0.j4lbgu9.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=super_secure_production_jwt_secret_key_change_this_to_something_very_long_and_random_for_maximum_security
`;

fs.writeFileSync('.env.production', backendEnv);
console.log('   ✅ Created .env.production');

// Frontend production env (template)
const frontendEnv = `# Update this URL after deploying your backend to Render
VITE_API_BASE_URL=https://your-backend-name.onrender.com
`;

const frontendDir = path.join('frontend');
if (!fs.existsSync(frontendDir)) {
  fs.mkdirSync(frontendDir, { recursive: true });
}

fs.writeFileSync(path.join(frontendDir, '.env.production'), frontendEnv);
console.log('   ✅ Created frontend/.env.production');

// Create Netlify redirects
const publicDir = path.join('frontend', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, '_redirects'), '/*    /index.html   200');
console.log('   ✅ Created frontend/public/_redirects');

// 3. Update CORS for production
console.log('\n3. Checking CORS configuration...');

const appJsPath = 'app.js';
if (fs.existsSync(appJsPath)) {
  const appContent = fs.readFileSync(appJsPath, 'utf8');
  if (appContent.includes('cors()')) {
    console.log('   ⚠️  Update CORS in app.js after deployment');
    console.log('      Add your frontend URL to the origin array');
  } else {
    console.log('   ✅ CORS configuration found');
  }
}

// 4. Create deployment checklist
const checklist = `# 🚀 Deployment Checklist

## Backend Deployment (Render)
- [ ] Push code to GitHub
- [ ] Create Web Service on Render
- [ ] Set environment variables:
  - [ ] NODE_ENV=production
  - [ ] MONGODB_URI=(your MongoDB URI)
  - [ ] JWT_SECRET=(secure random string)
- [ ] Deploy and test: https://your-backend.onrender.com/health

## Frontend Deployment (Netlify)
- [ ] Update VITE_API_BASE_URL in frontend/.env.production
- [ ] Deploy to Netlify (drag & drop or GitHub)
- [ ] Test: https://your-frontend.netlify.app

## Post-Deployment
- [ ] Update CORS in app.js with your frontend URL
- [ ] Create admin user in production
- [ ] Populate production database
- [ ] Test all functionality

## Admin Access
- Email: admin@skillbridge.com
- Password: Admin123!
- Note: Set role to 'admin' in MongoDB Atlas
`;

fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist);
console.log('   ✅ Created DEPLOYMENT_CHECKLIST.md');

console.log('\n🎉 Deployment preparation complete!');
console.log('\n📋 Next Steps:');
console.log('1. Follow QUICK_DEPLOY_GUIDE.md for step-by-step deployment');
console.log('2. Use DEPLOYMENT_CHECKLIST.md to track progress');
console.log('3. Update frontend/.env.production with your actual backend URL');
console.log('\n🌍 Your platform will be live globally soon!');

// 5. Show current status
console.log('\n📊 Current Status:');
console.log(`   Backend: Ready for Render deployment`);
console.log(`   Frontend: Ready for Netlify deployment`);
console.log(`   Database: Already hosted on MongoDB Atlas ✅`);
console.log(`   Products: ${fs.existsSync('populate-ethiopian-and-global-products.js') ? 'Ready to populate ✅' : 'Need populate script ❌'}`);