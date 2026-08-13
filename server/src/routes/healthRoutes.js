const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/', healthController.healthCheck);
router.get('/ai', healthController.aiHealthCheck);
router.get('/ai/campus', healthController.campusAiHealth);
router.get('/ai/gemini', healthController.geminiHealth);

module.exports = router;
