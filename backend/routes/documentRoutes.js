const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes under this namespace
router.use(protect);

router.route('/')
  .get(documentController.getDocuments);

router.route('/:id')
  .get(documentController.getDocumentById)
  .delete(documentController.deleteDocument);

module.exports = router;
