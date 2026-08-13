const CodeAnalysis = require('../models/CodeAnalysis');
const Activity = require('../models/Activity');
const AIService = require('../services/ai/AIService');

// @desc    Analyze code for bugs, complexity, and optimizations
// @route   POST /api/code/analyze
exports.analyzeCode = async (req, res, next) => {
  try {
    const { code, language = 'python', provider } = req.body;
    const userId = req.user ? req.user.id : null;
    const selectedProvider = provider || (req.user ? req.user.aiEngine : 'campus_ai');

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Please provide code content to analyze.'
      });
    }

    const systemPrompt = `You are Code Lab AI, an elite computer science code reviewer and optimization engine. 
Analyze the provided ${language} code thoroughly.
You MUST respond with a single, strictly valid JSON object adhering EXACTLY to this schema:
{
  "success": true,
  "bugs": [
    { "line": number_or_null, "type": "Error/Bug", "message": "description" }
  ],
  "warnings": [
    { "line": number_or_null, "message": "description" }
  ],
  "timeComplexity": "e.g. O(n)",
  "spaceComplexity": "e.g. O(1)",
  "explanation": "Detailed explanation of code logic and performance",
  "optimization": "Detailed performance optimization suggestions",
  "alternative": "Alternative algorithmic approach description",
  "improvedCode": "Complete clean refactored and optimized ${language} code"
}`;

    const prompt = `Target Language: ${language}\n\nCode to Analyze:\n\`\`\`${language}\n${code}\n\`\`\``;

    console.log(`[CodeController] Request ID ${req.requestId} sending ${language} code (${code.length} chars) to provider '${selectedProvider}'`);

    const resultJson = await AIService.generate({
      provider: selectedProvider,
      prompt: prompt,
      systemPrompt: systemPrompt,
      temperature: 0.2,
      jsonMode: true
    });

    // Save to database if user is logged in
    let savedRecord = null;
    if (userId) {
      savedRecord = await CodeAnalysis.create({
        user: userId,
        code: code,
        language: language,
        aiEngine: selectedProvider,
        explanation: resultJson.explanation || '',
        bugs: resultJson.bugs || [],
        warnings: resultJson.warnings || [],
        timeComplexity: resultJson.timeComplexity || 'O(1)',
        spaceComplexity: resultJson.spaceComplexity || 'O(1)',
        optimization: resultJson.optimization || '',
        alternative: resultJson.alternative || '',
        improvedCode: resultJson.improvedCode || ''
      });

      await Activity.create({
        user: userId,
        type: 'CODE_ANALYSIS',
        description: `Analyzed ${language} snippet (${code.length} chars)`
      });
    }

    return res.json({
      success: true,
      data: {
        id: savedRecord ? savedRecord._id : null,
        language: language,
        aiEngine: selectedProvider,
        bugs: resultJson.bugs || [],
        warnings: resultJson.warnings || [],
        timeComplexity: resultJson.timeComplexity || 'N/A',
        spaceComplexity: resultJson.spaceComplexity || 'N/A',
        explanation: resultJson.explanation || 'Code analysis completed successfully.',
        optimization: resultJson.optimization || '',
        alternative: resultJson.alternative || '',
        improvedCode: resultJson.improvedCode || code
      }
    });

  } catch (error) {
    console.error(`[CodeController Error ${req.requestId}] Code analysis failed:`, error.message);
    return res.status(500).json({
      success: false,
      error: 'AI_PROVIDER_ERROR',
      message: `The selected AI engine could not process the request: ${error.message}`
    });
  }
};

// @desc    Get user code review history
// @route   GET /api/code/history
exports.getCodeHistory = async (req, res, next) => {
  try {
    const history = await CodeAnalysis.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json({
      success: true,
      history: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get code analysis detail
// @route   GET /api/code/:id
exports.getAnalysisDetails = async (req, res, next) => {
  try {
    const record = await CodeAnalysis.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Code analysis record not found.' });
    }
    res.json({
      success: true,
      analysis: record
    });
  } catch (error) {
    next(error);
  }
};
