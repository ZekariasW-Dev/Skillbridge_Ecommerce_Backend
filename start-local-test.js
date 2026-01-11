#!/usr/bin/env node

console.log('🧪 Starting Fresh Local Test Environment');
console.log('=====================================\n');

const { spawn } = require('child_process');
const path = require('path');

// Function to start backend
function startBackend() {
  console.log('🔧 Starting Backend Server...');
  console.log('   Port: 3000');
  console.log('   Environment: Development');
  console.log('   Database: MongoDB Atlas');
  console.log('   Features: All APIs enabled\n');
  
  const backend = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });
  
  backend.on('error', (error) => {
    console.error('❌ Backend Error:', error);
  });
  
  return backend;
}

// Function to start frontend
function startFrontend() {
  console.log('🎨 Starting Frontend Development Server...');
  console.log('   Port: 5173');
  console.log('   Framework: React + Vite');
  console.log('   UI: Material-UI');
  console.log('   Features: All components enabled\n');
  
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(process.cwd(), 'frontend')
  });
  
  frontend.on('error', (error) => {
    console.error('❌ Frontend Error:', error);
  });
  
  return frontend;
}

// Start both servers
console.log('🚀 Launching Full-Stack E-commerce Platform...\n');

const backendProcess = startBackend();

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  const frontendProcess = startFrontend();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });
  
  // Show URLs after startup
  setTimeout(() => {
    console.log('\n🌟 Local Development Environment Ready!');
    console.log('=====================================');
    console.log('🔧 Backend API:     http://localhost:3000');
    console.log('🎨 Frontend App:    http://localhost:5173');
    console.log('👨‍💼 Admin Dashboard: http://localhost:5173/admin');
    console.log('🧪 API Health:      http://localhost:3000/health');
    console.log('📚 API Docs:        http://localhost:3000/');
    console.log('\n🔑 Admin Credentials:');
    console.log('   Email: admin@skillbridge.com');
    console.log('   Password: Admin123!');
    console.log('\n✨ Features to Test:');
    console.log('   ✅ Ethiopian products (pages 1-3)');
    console.log('   ✅ Global products (pages 4+)');
    console.log('   ✅ Product details (click any product)');
    console.log('   ✅ User registration/login');
    console.log('   ✅ Shopping cart (user-specific)');
    console.log('   ✅ Favorites system');
    console.log('   ✅ Order placement');
    console.log('   ✅ Admin dashboard with image upload');
    console.log('\n🎯 Ready for testing! Press Ctrl+C to stop both servers.');
  }, 5000);
  
}, 3000);