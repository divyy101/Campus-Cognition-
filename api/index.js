const mongoose = require('mongoose');
const app = require('../backend/app');
const env = require('../backend/config/env');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  // Check if mongoose connection is already established
  if (mongoose.connection.readyState >= 1) {
    cachedDb = mongoose.connection;
    return cachedDb;
  }
  
  try {
    const db = await mongoose.connect(env.mongoUri, {
      dbName: env.dbName,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedDb = db.connection;
    console.log(`[Vercel Serverless] MongoDB Connected: ${cachedDb.host}`);
    return cachedDb;
  } catch (err) {
    console.error(`[Vercel MongoDB Error] ${err.message}`);
    throw err;
  }
}

// Vercel serverless function export
module.exports = async (req, res) => {
  try {
    // Ensure database is connected before handling the request
    await connectToDatabase();
  } catch (err) {
    console.error('[Vercel Serverless] DB Connection failed, but continuing to Express app:', err.message);
  }
  
  // Pass the request to the Express application
  return app(req, res);
};
