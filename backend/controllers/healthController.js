const mongoose = require('mongoose');
const env = require('../config/env');
const AIService = require('../services/ai/AIService');
const { generateCampusAi } = require('../services/ai/campusAiProvider');
const { generateGemini } = require('../services/ai/geminiProvider');

// @desc    General health check
// @route   GET /api/health
exports.healthCheck = async (req, res) => {
  res.send('Backend is running');
};

// @desc    Database health check
// @route   GET /api/health/db
exports.dbHealthCheck = async (req, res) => {
  try {
    const isConfigured = !!process.env.MONGODB_URI;
    const readyState = mongoose.connection.readyState;
    const isConnected = readyState === 1;

    res.json({
      configured: isConfigured,
      readyState: readyState,
      connected: isConnected
    });
  } catch (error) {
    res.status(500).json({
      configured: !!process.env.MONGODB_URI,
      readyState: mongoose.connection.readyState,
      connected: false,
      error: error.message
    });
  }
};

// @desc    AI Health status diagnosis
// @route   GET /api/health/ai
exports.aiHealthCheck = async (req, res) => {
  const status = AIService.getStatus();
  res.json({
    status: 'ok',
    providers: status
  });
};

// @desc    Campus AI provider test
// @route   GET /api/health/ai/campus
exports.campusAiHealth = async (req, res) => {
  if (!env.campusAiKey) {
    return res.status(503).json({
      provider: 'campus_ai',
      configured: false,
      reachable: false,
      status: 'CAMPUS_AI_KEY_MISSING',
      message: 'Campus AI API key is not configured.'
    });
  }

  try {
    const testResponse = await generateCampusAi({
      prompt: 'Respond with OK if reachable.',
      temperature: 0.1
    });

    res.json({
      provider: 'campus_ai',
      configured: true,
      reachable: true,
      status: 'ok',
      sampleResponse: testResponse.trim()
    });
  } catch (error) {
    console.error('[HealthCheck] Campus AI failed:', error.message);
    res.status(502).json({
      provider: 'campus_ai',
      configured: true,
      reachable: false,
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Gemini provider test
// @route   GET /api/health/ai/gemini
exports.geminiHealth = async (req, res) => {
  if (!env.geminiKey || env.geminiKey === 'YOUR_API_KEY_HERE') {
    return res.status(503).json({
      provider: 'gemini',
      configured: false,
      reachable: false,
      status: 'GEMINI_KEY_MISSING',
      message: 'Gemini API key is not configured.'
    });
  }

  try {
    const testResponse = await generateGemini({
      prompt: 'Respond with OK if reachable.',
      temperature: 0.1
    });

    res.json({
      provider: 'gemini',
      configured: true,
      reachable: true,
      status: 'ok',
      sampleResponse: testResponse.trim()
    });
  } catch (error) {
    console.error('[HealthCheck] Gemini failed:', error.message);
    res.status(502).json({
      provider: 'gemini',
      configured: true,
      reachable: false,
      status: 'error',
      message: error.message
    });
  }
};
