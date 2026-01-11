const fs = require('fs');
const path = require('path');

console.log('🚀 Production Deployment Preparation Script');
console.log('==========================================\n');

// 1. Create production environment file
console.log('1. Creating production environment files...');

const productionEnv = `NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://zekarias:zack%40123@cluster0.j4lbgu9.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=super_secure_production_jwt_secret_key_change_this_to_something_very_long_and_random_for_maximum_security_in_production_environment

# Cloudinary Configuration (Optional - for better image handling)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Rate Limiting Configuration
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000

# Cache Configuration
CACHE_TTL=300
CACHE_MAX_KEYS=1000

# Logging Configuration
LOG_LEVEL=info
`;

fs.writeFileSync('.env.production', productionEnv);
console.log('✅ Created .env.production');

// 2. Create frontend production environment
const frontendProductionEnv = `# Update this with your actual backend URL after deployment
VITE_API_BASE_URL=https://your-backend-name.onrender.com
`;

const frontendEnvPath = path.join('frontend', '.env.production');
fs.writeFileSync(frontendEnvPath, frontendProductionEnv);
console.log('✅ Created frontend/.env.production');

// 3. Create Netlify redirects file
const netlifyRedirects = `/*    /index.html   200`;
const netlifyRedirectsPath = path.join('frontend', 'public', '_redirects');

// Ensure public directory exists
const publicDir = path.join('frontend', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(netlifyRedirectsPath, netlifyRedirects);
console.log('✅ Created frontend/public/_redirects');

// 4. Update package.json scripts for production
console.log('\n2. Updating package.json for production...');

const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add production scripts
packageJson.scripts = {
  ...packageJson.scripts,
  'build': 'npm install',
  'start:prod': 'NODE_ENV=production node server.js',
  'deploy:render': 'echo "Push to GitHub and deploy via Render dashboard"',
  'deploy:vercel': 'vercel --prod',
  'populate:prod': 'node populate-ethiopian-and-global-products.js',
  'create-admin:prod': 'node create-admin-user.js'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with production scripts');

// 5. Create deployment checklist
const deploymentChecklist = `# 🚀 Deployment Checklist

## Pre-Deployment
- [ ] Code committed and pushed to GitHub
- [ ] Environment variables reviewed and secured
- [ ] Database connection tested
- [ ] All features tested locally

## Backend Deployment (Render)
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set environment variables:
  - [ ] NODE_ENV=production
  - [ ] MONGODB_URI=(your MongoDB connection string)
  - [ ] JWT_SECRET=(generate a secure secret)
- [ ] Deploy and test API endpoints

## Frontend Deployment (Netlify)
- [ ] Update VITE_API_BASE_URL in frontend/.env.production
- [ ] Build frontend: \`cd frontend && npm run build\`
- [ ] Deploy to Netlify (drag & drop dist folder or connect GitHub)
- [ ] Test frontend functionality

## Post-Deployment
- [ ] Create admin user in production
- [ ] Populate production database with products
- [ ] Test all user flows:
  - [ ] User registration/login
  - [ ] Product browsing and details
  - [ ] Cart functionality
  - [ ] Favorites
  - [ ] Order placement
  - [ ] Admin dashboard
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and analytics

## URLs
- Backend: https://your-backend-name.onrender.com
- Frontend: https://your-frontend-name.netlify.app
- Admin: https://your-frontend-name.netlify.app/admin

## Admin Credentials
- Email: admin@skillbridge.com
- Password: Admin123!
- Note: Update role to 'admin' in MongoDB Atlas after first login
`;

fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', deploymentChecklist);
console.log('✅ Created DEPLOYMENT_CHECKLIST.md');

// 6. Create production data population script
const prodPopulateScript = `const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.production' });

// This script will populate your production database
// Make sure to update the API_BASE_URL if needed

const MONGODB_URI = process.env.MONGODB_URI;

async function populateProductionData() {
  console.log('🌍 Populating production database...');
  console.log('MongoDB URI:', MONGODB_URI ? 'Connected' : 'Not found');
  
  // Run the existing populate script
  require('./populate-ethiopian-and-global-products.js');
}

if (require.main === module) {
  populateProductionData();
}
`;

fs.writeFileSync('populate-production-data.js', prodPopulateScript);
console.log('✅ Created populate-production-data.js');

console.log('\n🎉 Production deployment preparation complete!');
console.log('\n📋 Next Steps:');
console.log('1. Review and update .env.production with secure values');
console.log('2. Push your code to GitHub');
console.log('3. Follow the GLOBAL_DEPLOYMENT_GUIDE.md for detailed deployment steps');
console.log('4. Use DEPLOYMENT_CHECKLIST.md to track your progress');
console.log('\n🌍 Your e-commerce platform will be live globally soon!');