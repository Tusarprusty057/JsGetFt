const mongoose = require('mongoose');
const connectDB = require('../config/database');
require('dotenv').config();

const initDatabase = async () => {
  try {
    console.log('🚀 Initializing database...');
    
    // Check if .env file is loaded
    console.log('🔍 Checking environment variables...');
    console.log('📍 MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('📍 NODE_ENV:', process.env.NODE_ENV);
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables!');
      console.error('💡 Please check your .env file in the root directory.');
      console.error('💡 Make sure it contains: MONGODB_URI=mongodb+srv://...');
      process.exit(1);
    }
    
    // Connect to database
    await connectDB();
    
    // Wait a moment for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if collections exist
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database Collections:');
    if (collections.length === 0) {
      console.log('   No collections found - database is empty');
    } else {
      collections.forEach(collection => {
        console.log(`   ✅ ${collection.name}`);
      });
    }
    
    // Test database operations
    console.log('\n🧪 Testing database operations...');
    
    // Test User model
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log(`   Users: ${userCount}`);
    
    // Test Exercise model
    const { Exercise } = require('../models/Workout');
    const exerciseCount = await Exercise.countDocuments();
    console.log(`   Exercises: ${exerciseCount}`);
    
    // Test Badge model
    const { Badge } = require('../models/Progress');
    const badgeCount = await Badge.countDocuments();
    console.log(`   Badges: ${badgeCount}`);
    
    console.log('\n✅ Database initialization complete!');
    console.log('🎉 Your FitTribe2 database is ready to use!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run initialization if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;