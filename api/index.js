const app = require('../backend/app');

// Vercel serverless function export
module.exports = async (req, res) => {
  // Pass the request to the Express application
  // DB connection is now handled globally inside backend/app.js
  return app(req, res);
};
