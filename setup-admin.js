require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('./src/config/db');

const createAdminUser = async () => {
  try {
    await db.connect();
    
    // Strong password that meets Page 4 PDF requirements
    const strongPassword = 'AdminPass123!';
    
    const adminData = {
      id: uuidv4(),
      username: 'admin',  // Alphanumeric username
      email: 'admin@example.com',
      password: await bcrypt.hash(strongPassword, 10),
      role: 'admin',
      createdAt: new Date()
    };
    
    // Check if admin already exists
    const existingAdmin = await db.getCollection('users').findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: AdminPass123!');
      console.log('👤 Username: admin');
      console.log('👤 Role: admin');
      return;
    }
    
    // Create admin user
    await db.getCollection('users').insertOne(adminData);
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: AdminPass123!');
    console.log('👤 Username: admin (alphanumeric only)');
    console.log('👤 Role: admin');
    console.log('\n🔒 Password meets strong requirements:');
    console.log('  ✅ 8+ characters long');
    console.log('  ✅ Contains uppercase letters');
    console.log('  ✅ Contains lowercase letters');
    console.log('  ✅ Contains numbers');
    console.log('  ✅ Contains special characters');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await db.close();
  }
};

createAdminUser();