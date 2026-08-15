const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.get('/search', optionalProtect, scholarshipController.searchScholarships);
router.post('/explore', protect, scholarshipController.exploreScholarships);
router.post('/analyze', protect, scholarshipController.analyzeScholarship);

module.exports = router;
