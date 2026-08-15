const mongoose = require('mongoose');
const connectDB = require('../backend/config/db');
const app = require('../backend/app');

// Vercel serverless function export
module.exports = async (req, res) => {
  try {
    // Ensure database is connected before handling the request
    const mongooseInstance = await connectDB();
    
    // Explicitly verify connection state before allowing Express to run
    if (!mongooseInstance || mongooseInstance.connection.readyState !== 1) {
      const state = mongooseInstance ? mongooseInstance.connection.readyState : 'unknown';
      throw new Error(`Connection established but readyState is ${state} instead of 1 (connected)`);
    }
    
    // Pass the request to the Express application
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Serverless] DB Connection failed:', err.message);
    
    return res.status(503).json({
      success: false,
      error: 'Database Connection Error',
      message: 'Could not connect to MongoDB. If this is deployed on Vercel, please ensure that MONGODB_URI is set correctly and that 0.0.0.0/0 is whitelisted in your MongoDB Atlas Network Access settings.',
      details: err.message
    });
  }
};
