const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, default: 'Study Session' },
  scope: { type: String, default: 'Exam Focused' },
  syllabusFilename: { type: String },
  notesFilename: { type: String },
  importantTopics: { type: Array, default: [] },
  studyPriority: { type: Array, default: [] },
  weeklyPlan: { type: Array, default: [] },
  fullAnalysis: { type: Object, default: {} },
  masteryScores: { type: Map, of: Number, default: {} }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudySession', studySessionSchema);
