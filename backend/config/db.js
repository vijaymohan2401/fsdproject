const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB Atlas or local MongoDB instance
 * FSD-2 Concept: Mongoose Connection Management & Event Handling
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spendwise';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if server unreachable
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database: ${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.warn('------------------------------------------------------------');
    console.warn('[MongoDB WARNING] Could not connect to MongoDB database:');
    console.warn(`  Reason: ${error.message}`);
    console.warn('');
    console.warn('  NOTE FOR STUDENT / EXAMINER:');
    console.warn('  1. To connect to MongoDB Atlas (cloud), open backend/.env and');
    console.warn('     set MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/spendwise');
    console.warn('  2. SpendWise includes an intelligent in-memory data store fallback');
    console.warn('     so you can test every single feature, API, and page immediately!');
    console.warn('------------------------------------------------------------');
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
