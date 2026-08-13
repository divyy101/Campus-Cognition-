const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  branch: { type: String, default: 'CSE' },
  cgpa: { type: Number, default: 8.0 },
  skills: [{ type: String }],
  interests: [{ type: String }],
  careerGoals: { type: String, default: '' },
  targetCompanies: [{ type: String }],
  preferredLocations: [{ type: String }],
  aiEngine: { type: String, enum: ['campus_ai', 'gemini', 'openai'], default: 'campus_ai' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
