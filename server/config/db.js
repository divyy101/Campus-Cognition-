const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      dbName: env.dbName,
    });
    console.log(`[MongoDB] Connected to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    // Non-fatal exit in dev mode so mock/fallback works if offline
    if (env.nodeEnv === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
