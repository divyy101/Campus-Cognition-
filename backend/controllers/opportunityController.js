const SearchService = require('../services/searchService');
const UserOpportunity = require('../models/UserOpportunity');
const Opportunity = require('../models/Opportunity');
const Activity = require('../models/Activity');

// @desc    Search general opportunities (Hackathons, Competitions, Developer Programs)
// @route   GET /api/opportunities/search
exports.searchOpportunities = async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const userProfile = {
      branch: req.user ? req.user.branch : 'CSE',
      cgpa: req.user ? req.user.cgpa : 8.0,
      skills: req.user ? req.user.skills : ['Python', 'Java', 'React']
    };

    const searchRes = await SearchService.search({
      query: q.trim(),
      type: 'opportunity',
      userProfile: userProfile,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });

    res.json({
      success: true,
      data: searchRes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Explore opportunities by role/company
// @route   POST /api/opportunities/explore
exports.exploreOpportunities = async (req, res, next) => {
  try {
    const { role = '', branch = '', cgpa = '', skills = '' } = req.body;
    const userProfile = {
      branch: branch || (req.user ? req.user.branch : 'CSE'),
      cgpa: cgpa ? parseFloat(cgpa) : (req.user ? req.user.cgpa : 8.0),
      skills: skills ? skills.split(',').map(s => s.trim()) : (req.user ? req.user.skills : [])
    };

    const query = `${role} ${skills}`.trim() || 'software engineering';
    const searchRes = await SearchService.search({
      query: query.trim(),
      type: 'opportunity',
      userProfile: userProfile,
      page: 1,
      limit: 30
    });

    res.json({
      success: true,
      message: `Found ${searchRes.results.length} matching opportunities`,
      matched_opportunities: searchRes.results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update saved/applied status for an opportunity
// @route   POST /api/opportunities/status
exports.updateOpportunityStatus = async (req, res, next) => {
  try {
    const { opportunityId, title, company, url, status = 'SAVED' } = req.body;
    const userId = req.user.id;

    let oppRecord = null;
    if (opportunityId && opportunityId.length === 24) {
      oppRecord = await Opportunity.findById(opportunityId);
    }

    if (!oppRecord) {
      oppRecord = await Opportunity.create({
        title: title || 'Saved Opportunity',
        company: company || 'Tech Company',
        url: url || '#',
        source: 'User Saved'
      });
    }

    const userOpp = await UserOpportunity.findOneAndUpdate(
      { user: userId, opportunity: oppRecord._id },
      { status: status },
      { upsert: true, new: true }
    );

    await Activity.create({
      user: userId,
      type: 'OPPORTUNITY_STATUS',
      description: `Marked '${oppRecord.title}' as ${status}`
    });

    res.json({
      success: true,
      message: `Opportunity status updated to ${status}`,
      record: userOpp
    });
  } catch (error) {
    next(error);
  }
};
