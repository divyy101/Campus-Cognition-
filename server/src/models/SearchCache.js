const mongoose = require('mongoose');

const searchCacheSchema = new mongoose.Schema({
  queryHash: { type: String, required: true, unique: true },
  query: { type: String, required: true },
  results: { type: Array, required: true },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('SearchCache', searchCacheSchema);
