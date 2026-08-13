const SearchService = require('../services/searchService');
const AIService = require('../services/ai/AIService');

// @desc    Search scholarships with official live web retrieval
// @route   GET /api/scholarships/search
exports.searchScholarships = async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const userProfile = {
      branch: req.user ? req.user.branch : 'CSE',
      cgpa: req.user ? req.user.cgpa : 8.0,
      skills: req.user ? req.user.skills : []
    };

    const searchRes = await SearchService.search({
      query: `${q} scholarship`.trim(),
      type: 'scholarship',
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

// @desc    Explore scholarships dynamically
// @route   POST /api/scholarships/explore
exports.exploreScholarships = async (req, res, next) => {
  try {
    const { query = '', branch, cgpa } = req.body;
    const userProfile = {
      branch: branch || (req.user ? req.user.branch : 'CSE'),
      cgpa: cgpa ? parseFloat(cgpa) : (req.user ? req.user.cgpa : 8.0),
      skills: req.user ? req.user.skills : []
    };

    const searchRes = await SearchService.search({
      query: `${query} scholarship`.trim(),
      type: 'scholarship',
      userProfile: userProfile,
      page: 1,
      limit: 20
    });

    res.json({
      success: true,
      scholarships: searchRes.results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze scholarship eligibility & required documents
// @route   POST /api/scholarships/analyze
exports.analyzeScholarship = async (req, res, next) => {
  try {
    const { scholarshipInfo, provider } = req.body;
    const selectedProvider = provider || (req.user ? req.user.aiEngine : 'campus_ai');

    if (!scholarshipInfo) {
      return res.status(400).json({ success: false, message: 'Scholarship information is required.' });
    }

    const userBranch = req.user ? req.user.branch : 'CSE';
    const userCgpa = req.user ? req.user.cgpa : 8.0;

    const systemPrompt = `You are Scholarship Counselor AI. Analyze the provided scholarship opportunity against the student profile.
Respond in strict JSON:
{
  "eligibilityScore": number_0_to_100,
  "verdict": "Eligible / Conditional / Ineligible",
  "keyRequirements": ["req1", "req2"],
  "documentsRequired": ["doc1", "doc2"],
  "applicationSteps": ["step1", "step2"],
  "whyYouQualify": "Reason summary"
}`;

    const prompt = `Student Branch: ${userBranch}\nCGPA: ${userCgpa}\n\nScholarship Details:\n${scholarshipInfo}`;

    const analysisJson = await AIService.generate({
      provider: selectedProvider,
      prompt: prompt,
      systemPrompt: systemPrompt,
      temperature: 0.3,
      jsonMode: true
    });

    res.json({
      success: true,
      analysis: analysisJson
    });
  } catch (error) {
    next(error);
  }
};
