const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Document' },
  filename: { type: String, required: true },
  fileType: { type: String, default: 'pdf' },
  fileSize: { type: Number, default: 0 },
  docHash: { type: String },
  status: { type: String, enum: ['PROCESSING', 'COMPLETED', 'FAILED'], default: 'PROCESSING' },
  chunks: [{
    section: { type: String },
    content: { type: String }
  }],
  analysis: { type: Object, default: {} }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
