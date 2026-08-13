const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, default: 'Internship' }, // Internship, Scholarship, Hackathon, Job, etc.
  category: { type: String, enum: ['internship', 'scholarship', 'opportunity'], default: 'opportunity' },
  deadline: { type: String, default: 'N/A' },
  url: { type: String, default: '#' },
  source: { type: String, default: 'Official Portal' },
  skills: [{ type: String }],
  stipend: { type: String, default: 'Competitive' },
  location: { type: String, default: 'Remote / India' },
  eligibility: { type: String, default: 'Open to eligible candidates' },
  matchScore: { type: Number, default: 85 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
