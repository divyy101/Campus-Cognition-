const Activity = require('../models/Activity');

// @desc    Get user activity log
// @route   GET /api/activity
exports.getActivityLog = async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      success: true,
      activities: activities
    });
  } catch (error) {
    next(error);
  }
};
