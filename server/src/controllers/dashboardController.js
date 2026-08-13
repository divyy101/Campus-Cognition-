const StudySession = require('../models/StudySession');
const CodeAnalysis = require('../models/CodeAnalysis');
const UserOpportunity = require('../models/UserOpportunity');
const Activity = require('../models/Activity');
const SearchService = require('../services/searchService');
const { getNextBestAction } = require('../services/roadmapService');

// @desc    Get dashboard metrics, momentum, and recommendations
// @route   GET /api/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch study sessions count & recent sessions
    const studySessions = await StudySession.find({ user: userId }).sort({ createdAt: -1 }).limit(5);
    const studyCount = await StudySession.countDocuments({ user: userId });

    // Fetch code analyses count & recent analyses
    const codeAnalyses = await CodeAnalysis.find({ user: userId }).sort({ createdAt: -1 }).limit(5);
    const codeCount = await CodeAnalysis.countDocuments({ user: userId });

    // Fetch saved/applied opportunities
    const userOpps = await UserOpportunity.find({ user: userId }).populate('opportunity').limit(5);
    const oppCount = await UserOpportunity.countDocuments({ user: userId });

    // Fetch recent activities
    const activities = await Activity.find({ user: userId }).sort({ timestamp: -1 }).limit(10);

    // Get live recommendations based on user branch/skills
    const userProfile = {
      branch: req.user.branch || 'CSE',
      cgpa: req.user.cgpa || 8.0,
      skills: req.user.skills || ['Python', 'Java', 'React'],
      interests: req.user.interests || ['Software Engineering']
    };

    const searchRes = await SearchService.search({
      query: `${userProfile.branch} internship`,
      type: 'internship',
      userProfile: userProfile,
      page: 1,
      limit: 4
    });

    // Next action recommendation
    const nextAction = await getNextBestAction(userId);

    res.json({
      success: true,
      data: {
        stats: {
          studyStreak: Math.min(studyCount + 3, 14),
          studyCount: studyCount,
          codeReviewCount: codeCount,
          appliedOpportunities: oppCount
        },
        recentSessions: studySessions,
        recentCodeHistory: codeAnalyses,
        savedOpportunities: userOpps,
        recommendedOpportunities: searchRes.results,
        activities: activities,
        nextBestAction: nextAction
      }
    });
  } catch (error) {
    next(error);
  }
};
