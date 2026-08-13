const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.get('/search', optionalProtect, opportunityController.searchOpportunities);
router.post('/explore', protect, opportunityController.exploreOpportunities);
router.post('/status', protect, opportunityController.updateOpportunityStatus);

module.exports = router;
