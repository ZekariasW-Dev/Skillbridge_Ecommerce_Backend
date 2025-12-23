require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('./src/config/db');

const createAdminUser = async () => {
  try {
    await db.connect();
    
    const adminData = {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('AdminPass123!', 10),
      role: 'admin',
      createdAt: new Date()
    };
    
    // Check if admin already exists
    const existingAdmin = await db.getCollection('users').findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    await db.getCollection('users').insertOne(adminData);
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: AdminPass123!');
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await db.close();
  }
};

createAdminUser();