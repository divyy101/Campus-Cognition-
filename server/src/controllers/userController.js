const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      branch, cgpa, skills, interests, careerGoals,
      targetCompanies, preferredLocations, aiEngine
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (branch !== undefined) user.branch = branch;
    if (cgpa !== undefined) user.cgpa = parseFloat(cgpa) || user.cgpa;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []);
    if (interests !== undefined) user.interests = Array.isArray(interests) ? interests : (interests ? interests.split(',').map(i => i.trim()) : []);
    if (careerGoals !== undefined) user.careerGoals = careerGoals;
    if (targetCompanies !== undefined) user.targetCompanies = Array.isArray(targetCompanies) ? targetCompanies : (targetCompanies ? targetCompanies.split(',').map(c => c.trim()) : []);
    if (preferredLocations !== undefined) user.preferredLocations = Array.isArray(preferredLocations) ? preferredLocations : (preferredLocations ? preferredLocations.split(',').map(l => l.trim()) : []);
    if (aiEngine && ['campus_ai', 'gemini', 'openai'].includes(aiEngine)) {
      user.aiEngine = aiEngine;
    }

    await user.save();

    await Activity.create({
      user: user._id,
      type: 'PROFILE_UPDATE',
      description: 'Updated profile settings and target goals'
    });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: user
    });
  } catch (error) {
    next(error);
  }
};
