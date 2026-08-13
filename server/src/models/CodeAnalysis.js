const mongoose = require('mongoose');

const codeAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true, default: 'python' },
  aiEngine: { type: String, default: 'campus_ai' },
  explanation: { type: String, default: '' },
  bugs: { type: Array, default: [] },
  warnings: { type: Array, default: [] },
  timeComplexity: { type: String, default: 'N/A' },
  spaceComplexity: { type: String, default: 'N/A' },
  optimization: { type: String, default: '' },
  alternative: { type: String, default: '' },
  improvedCode: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('CodeAnalysis', codeAnalysisSchema);
