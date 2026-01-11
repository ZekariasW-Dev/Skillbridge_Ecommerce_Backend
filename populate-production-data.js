const { MongoClient } = require('mongodb');
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
