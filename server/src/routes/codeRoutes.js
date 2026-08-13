const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, codeController.analyzeCode);
router.get('/history', protect, codeController.getCodeHistory);
router.get('/:id', protect, codeController.getAnalysisDetails);

module.exports = router;
