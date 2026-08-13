const path = require('path');
const fs = require('fs');
const StudySession = require('../models/StudySession');
const Document = require('../models/Document');
const Activity = require('../models/Activity');
const DocumentService = require('../services/documentService');
const AIService = require('../services/ai/AIService');
const { getNextBestAction, updateTopicMastery } = require('../services/roadmapService');

// @desc    Upload study materials (Syllabus mandatory + Notes optional) & generate study plan
// @route   POST /api/study/analyze
exports.analyzeStudyMaterials = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title = 'Study Session', scope = 'Exam Focused', provider } = req.body;
    const selectedProvider = provider || req.user.aiEngine || 'campus_ai';

    const files = req.files || {};
    const syllabusFile = files.syllabus ? files.syllabus[0] : null;
    const notesFile = files.notes ? files.notes[0] : null;

    if (!syllabusFile) {
      return res.status(400).json({
        success: false,
        message: 'Syllabus file is required. Please upload your course syllabus.'
      });
    }

    // Extract text from syllabus
    const syllabusText = await DocumentService.extractText(syllabusFile.path, path.extname(syllabusFile.originalname).slice(1));
    
    // Extract optional notes
    let notesText = '';
    if (notesFile) {
      try {
        notesText = await DocumentService.extractText(notesFile.path, path.extname(notesFile.originalname).slice(1));
      } catch (e) {
        console.warn('[StudyController] Notes extraction failed (continuing without):', e.message);
      }
    }

    const systemPrompt = `You are Study Agent AI, an expert exam strategist and syllabus analyzer for university students.
Analyze the provided course syllabus and notes.
Output a valid JSON object matching EXACTLY this structure:
{
  "subject": "${title}",
  "syllabus_summary": "High level overview of syllabus",
  "repeated_topics": [
    { "topic": "Topic Name", "weight": "High", "reason": "Reason for high priority" }
  ],
  "important_questions": [
    { "question": "Sample Question Text", "concept": "Concept Name", "frequency": "Very Frequent" }
  ],
  "weekly_plan": [
    { "week": 1, "focus": "Module 1 Basics", "tasks": ["Read Chapter 1", "Practice 5 PYQ"] }
  ]
}`;

    const prompt = `Course Title: ${title}\nExam Scope: ${scope}\n\nSyllabus Content:\n${syllabusText.substring(0, 15000)}\n\nNotes Content:\n${notesText.substring(0, 15000)}`;

    const analysisJson = await AIService.generate({
      provider: selectedProvider,
      prompt: prompt,
      systemPrompt: systemPrompt,
      temperature: 0.3,
      jsonMode: true
    });

    // Save study session to DB
    const session = await StudySession.create({
      user: userId,
      title: title,
      scope: scope,
      syllabusFilename: syllabusFile.originalname,
      notesFilename: notesFile ? notesFile.originalname : null,
      importantTopics: analysisJson.important_questions || [],
      studyPriority: analysisJson.repeated_topics || [],
      weeklyPlan: analysisJson.weekly_plan || [],
      fullAnalysis: analysisJson
    });

    // Store chunks in Document model for RAG
    const chunks = DocumentService.chunkText(`${syllabusText}\n\n${notesText}`);
    await Document.create({
      user: userId,
      title: title,
      filename: syllabusFile.originalname,
      status: 'COMPLETED',
      chunks: chunks,
      analysis: analysisJson
    });

    await Activity.create({
      user: userId,
      type: 'STUDY_ANALYSIS',
      description: `Generated study roadmap for '${title}'`
    });

    // Clean up temporary files safely
    if (fs.existsSync(syllabusFile.path)) fs.unlinkSync(syllabusFile.path);
    if (notesFile && fs.existsSync(notesFile.path)) fs.unlinkSync(notesFile.path);

    res.json({
      success: true,
      message: 'Study plan generated successfully!',
      sessionId: session._id,
      analysis: analysisJson
    });

  } catch (error) {
    next(error);
  }
};

// @desc    RAG Q&A over uploaded study materials
// @route   POST /api/study/rag/ask
exports.askRAG = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { question, provider } = req.body;
    const selectedProvider = provider || req.user.aiEngine || 'campus_ai';

    if (!question) {
      return res.status(400).json({ success: false, message: 'Question parameter is required.' });
    }

    // Retrieve user's document chunks from DB
    const userDocs = await Document.find({ user: userId, status: 'COMPLETED' });
    let allChunks = [];
    userDocs.forEach(doc => {
      if (doc.chunks && doc.chunks.length > 0) {
        allChunks = allChunks.concat(doc.chunks);
      }
    });

    const ragResponse = await DocumentService.answerQuestion(question, allChunks, selectedProvider);

    res.json({
      success: true,
      answer: ragResponse.answer,
      sources: ragResponse.sources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user study sessions
// @route   GET /api/study/sessions
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await StudySession.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      sessions: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get next best study action
// @route   GET /api/study/next-action
exports.getStudyNextAction = async (req, res, next) => {
  try {
    const action = await getNextBestAction(req.user.id);
    res.json({
      success: true,
      action: action
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update topic mastery score
// @route   POST /api/study/mastery
exports.updateMastery = async (req, res, next) => {
  try {
    const { sessionId, topic, score } = req.body;
    if (!sessionId || !topic || score === undefined) {
      return res.status(400).json({ success: false, message: 'sessionId, topic, and score are required.' });
    }
    const updated = await updateTopicMastery(req.user.id, sessionId, topic, parseInt(score, 10));
    res.json({
      success: updated,
      message: updated ? 'Mastery updated!' : 'Failed to update mastery score.'
    });
  } catch (error) {
    next(error);
  }
};
