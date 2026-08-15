const mongoose = require('mongoose');
const env = require('./env');

// Disable buffering globally
mongoose.set('bufferCommands', false);

// Global caching for Vercel Serverless
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    if (cached.conn.connection.readyState === 1) {
      return cached.conn;
    }
    cached.promise = null; // Force reconnect if disconnected
  }

  if (!cached.promise) {
    const uri = env.mongoUri;
    
    if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
        // Allow localhost in development, but not in Vercel production
        if (process.env.VERCEL) {
             throw new Error('MONGODB_URI environment variable is missing or pointing to localhost. Please configure it in Vercel settings.');
        }
    }

    const opts = {
      dbName: env.dbName,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false, // Explicitly set false
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected to host: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    }).catch(error => {
      console.error(`[MongoDB Error] Connection failed: ${error.message}`);
      cached.promise = null;
      if (env.nodeEnv === 'production' && !process.env.VERCEL) {
        process.exit(1);
      }
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    throw err;
  }
};

module.exports = connectDB;
