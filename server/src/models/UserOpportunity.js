const mongoose = require('mongoose');

const userOpportunitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  status: { type: String, enum: ['SAVED', 'APPLIED', 'INTERVIEW', 'REJECTED', 'ACCEPTED'], default: 'SAVED' }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserOpportunity', userOpportunitySchema);
