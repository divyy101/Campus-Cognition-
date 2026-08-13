const SearchService = require('../services/searchService');
const AIService = require('../services/ai/AIService');

// @desc    Search internships with dynamic live web retrieval
// @route   GET /api/internships/search
exports.searchInternships = async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const userProfile = {
      branch: req.user ? req.user.branch : 'CSE',
      cgpa: req.user ? req.user.cgpa : 8.0,
      skills: req.user ? req.user.skills : ['Python', 'Java', 'React']
    };

    const searchRes = await SearchService.search({
      query: `${q} internship`.trim(),
      type: 'internship',
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

// @desc    Explore internships dynamically
// @route   POST /api/internships/explore
exports.exploreInternships = async (req, res, next) => {
  try {
    const { query = '', branch, cgpa } = req.body;
    const userProfile = {
      branch: branch || (req.user ? req.user.branch : 'CSE'),
      cgpa: cgpa ? parseFloat(cgpa) : (req.user ? req.user.cgpa : 8.0),
      skills: req.user ? req.user.skills : []
    };

    const searchRes = await SearchService.search({
      query: `${query} internship`.trim(),
      type: 'internship',
      userProfile: userProfile,
      page: 1,
      limit: 20
    });

    res.json({
      success: true,
      internships: searchRes.results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze internship job description fit using AI
// @route   POST /api/internships/analyze
exports.analyzeInternship = async (req, res, next) => {
  try {
    const { internshipInfo, provider } = req.body;
    const selectedProvider = provider || (req.user ? req.user.aiEngine : 'campus_ai');

    if (!internshipInfo) {
      return res.status(400).json({ success: false, message: 'Internship description text is required.' });
    }

    const userBranch = req.user ? req.user.branch : 'CSE';
    const userCgpa = req.user ? req.user.cgpa : 8.0;
    const userSkills = req.user ? (req.user.skills || []).join(', ') : 'Java, Python, Data Structures';

    const systemPrompt = `You are Career Match AI. Analyze the provided internship listing against the student profile.
Respond in strict JSON:
{
  "fitScore": number_0_to_100,
  "verdict": "Highly Recommended / Suitable / Challenge",
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3"],
  "keyResponsibilities": ["task1", "task2"],
  "preparationAdvice": "Detailed actionable tips for interview prep"
}`;

    const prompt = `Student Branch: ${userBranch}\nCGPA: ${userCgpa}\nSkills: ${userSkills}\n\nInternship Details:\n${internshipInfo}`;

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
