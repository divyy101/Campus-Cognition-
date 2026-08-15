const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.get('/search', optionalProtect, internshipController.searchInternships);
router.post('/explore', protect, internshipController.exploreInternships);
router.post('/analyze', protect, internshipController.analyzeInternship);

module.exports = router;
