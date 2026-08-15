const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/analyze', protect, upload.fields([
  { name: 'syllabus', maxCount: 1 },
  { name: 'notes', maxCount: 1 }
]), studyController.analyzeStudyMaterials);

router.post('/rag/ask', protect, studyController.askRAG);
router.get('/sessions', protect, studyController.getSessions);
router.get('/next-action', protect, studyController.getStudyNextAction);
router.post('/mastery', protect, studyController.updateMastery);

module.exports = router;
