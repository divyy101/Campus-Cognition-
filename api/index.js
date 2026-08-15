const mongoose = require('mongoose');

// Crucial: Disable Mongoose buffering GLOBALLY before any models are imported.
mongoose.set('bufferCommands', false);

const app = require('../backend/app');

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

// Global caching for Vercel Serverless
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
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

  // Prevent accidental local DB connections on Vercel
  if (!rawUri || rawUri.includes('localhost') || rawUri.includes('127.0.0.1')) {
    throw new Error('MONGODB_URI environment variable is missing or pointing to localhost. Please configure it in Vercel settings.');
  }

  if (cached.conn) {
    console.log(`[Diagnostic] Returning cached connection. ReadyState: ${cached.conn.connection.readyState}`);
    if (cached.conn.connection.readyState === 1) {
      return cached.conn;
    }
    console.log(`[Diagnostic] Cached connection is not fully ready (state: ${cached.conn.connection.readyState}), reconnecting...`);
    cached.promise = null; // Force reconnect
  }
  
  if (!cached.promise) {
    console.log(`[Diagnostic] Attempting new mongoose.connect...`);
    const opts = {
      dbName: process.env.MONGODB_DB_NAME || 'campus_cognition',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };
    
    cached.promise = mongoose.connect(rawUri, opts).then((mongooseInstance) => {
      console.log(`[Vercel Serverless] MongoDB Connected Successfully: ${mongooseInstance.connection.host}`);
      console.log(`[Diagnostic] New Connection ReadyState: ${mongooseInstance.connection.readyState}`);
      return mongooseInstance;
    }).catch(err => {
      console.error(`[Diagnostic] Connection promise rejected: ${err.message}`);
      cached.promise = null;
      throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
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
    const mongooseInstance = await connectToDatabase();
    
    // Explicitly verify connection state before allowing Express to run
    if (mongooseInstance.connection.readyState !== 1) {
      throw new Error(`Connection established but readyState is ${mongooseInstance.connection.readyState} instead of 1 (connected)`);
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
