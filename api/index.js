const mongoose = require('mongoose');

// Crucial: Disable Mongoose buffering GLOBALLY before any models are imported.
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 0); // Force immediate failure if disconnected

const app = require('../backend/app');
const env = require('../backend/config/env');

let cachedDb = null;

// Safe URI string masking for diagnostics
function maskUri(uri) {
  if (!uri) return 'UNDEFINED';
  try {
    const url = new URL(uri);
    return `${url.protocol}//***:***@${url.host}${url.pathname}`;
  } catch (e) {
    return 'INVALID_URI_FORMAT';
  }
}

async function connectToDatabase() {
  console.log('[Diagnostic] --- MongoDB Connection Audit ---');
  
  // 1. Check environment variables
  const rawUri = process.env.MONGODB_URI;
  console.log(`[Diagnostic] process.env.MONGODB_URI exists: ${!!rawUri}`);
  if (rawUri) {
    console.log(`[Diagnostic] URI Scheme starts with mongodb:// : ${rawUri.startsWith('mongodb://')}`);
    console.log(`[Diagnostic] URI Scheme starts with mongodb+srv:// : ${rawUri.startsWith('mongodb+srv://')}`);
    console.log(`[Diagnostic] Safe URI Hostname: ${maskUri(rawUri)}`);
  } else {
    console.log(`[Diagnostic] WARNING: process.env.MONGODB_URI is undefined or empty!`);
  }

  if (cachedDb) {
    console.log(`[Diagnostic] Returning cached connection. ReadyState: ${cachedDb.readyState}`);
    return cachedDb;
  }
  
  if (mongoose.connection.readyState >= 1) {
    console.log(`[Diagnostic] Returning existing mongoose connection. ReadyState: ${mongoose.connection.readyState}`);
    cachedDb = mongoose.connection;
    return cachedDb;
  }
  
  try {
    // 2. Prevent accidental local DB connections on Vercel
    if (!rawUri || rawUri.includes('localhost') || rawUri.includes('127.0.0.1')) {
      throw new Error('MONGODB_URI environment variable is missing or pointing to localhost. Please configure it in Vercel settings.');
    }

    console.log(`[Diagnostic] Attempting mongoose.connect...`);
    const db = await mongoose.connect(rawUri, {
      dbName: process.env.MONGODB_DB_NAME || 'campus_cognition',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    
    cachedDb = db.connection;
    console.log(`[Vercel Serverless] MongoDB Connected Successfully: ${cachedDb.host}`);
    console.log(`[Diagnostic] New Connection ReadyState: ${cachedDb.readyState}`);
    return cachedDb;
  } catch (err) {
    console.error(`[Diagnostic] Connection FAILED.`);
    console.error(`[Vercel MongoDB Error] ${err.message}`);
    throw err;
  }
}

// Vercel serverless function export
module.exports = async (req, res) => {
  try {
    // Ensure database is connected before handling the request
    const dbConn = await connectToDatabase();
    
    // Explicitly verify connection state before allowing Express to run
    if (dbConn.readyState !== 1) {
      throw new Error(`Connection established but readyState is ${dbConn.readyState} instead of 1 (connected)`);
    }
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
