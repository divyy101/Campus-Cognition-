const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

/**
 * Get all documents for the authenticated user
 */
exports.getDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documents = await Document.find({ user: userId })
      .select('-chunks') // Exclude chunks from list view for performance
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single document by ID
 */
exports.getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or unauthorized'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a document by ID and remove its physical file
 */
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or unauthorized'
      });
    }

    // Delete the file from the filesystem if it exists
    if (document.filename) {
      const filePath = path.resolve(__dirname, '../../static/uploads', document.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Document.deleteOne({ _id: document._id });

    res.json({
      success: true,
      message: 'Document and associated file deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
