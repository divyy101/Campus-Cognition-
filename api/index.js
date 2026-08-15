const mongoose = require('mongoose');

// Crucial: Disable Mongoose buffering GLOBALLY before any models are imported.
// This prevents the 10000ms "buffering timed out" hang when the database isn't connected.
mongoose.set('bufferCommands', false);

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
    // Prevent accidental local DB connections on Vercel
    if (!env.mongoUri || env.mongoUri.includes('localhost') || env.mongoUri.includes('127.0.0.1')) {
      throw new Error('MONGODB_URI environment variable is missing or pointing to localhost. Please configure it in Vercel settings.');
    }

    const db = await mongoose.connect(env.mongoUri, {
      dbName: env.dbName,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false, // Crucial for serverless: fail instantly if disconnected
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
    console.error('[Vercel Serverless] DB Connection failed:', err.message);
    
    // If it's not a health check, return 503 immediately instead of buffering indefinitely
    if (!req.url.includes('/health')) {
      return res.status(503).json({
        success: false,
        error: 'Database Connection Error',
        message: 'Could not connect to MongoDB. If this is deployed on Vercel, please ensure that MONGODB_URI is set correctly and that 0.0.0.0/0 is whitelisted in your MongoDB Atlas Network Access settings.',
        details: err.message
      });
    }
  }
  
  // Pass the request to the Express application
  return app(req, res);
};
