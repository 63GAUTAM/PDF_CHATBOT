const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Bookmark = require('../models/Bookmark');
const authMiddleware = require('../middleware/authMiddleware');

// Create a bookmark
router.post('/',
  authMiddleware,
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('messageId').notEmpty().withMessage('Message ID is required'),
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
  body('tags').optional().isArray(),
  body('notes').optional().isLength({ max: 500 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const bookmark = new Bookmark({
        userId: req.user.id,
        sessionId: req.body.sessionId,
        messageId: req.body.messageId,
        question: req.body.question,
        answer: req.body.answer,
        tags: req.body.tags || [],
        notes: req.body.notes,
        pdfId: req.body.pdfId
      });

      await bookmark.save();

      res.status(201).json({
        success: true,
        message: 'Bookmark created successfully',
        data: bookmark
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Get all bookmarks for user
router.get('/',
  authMiddleware,
  async (req, res) => {
    try {
      const bookmarks = await Bookmark.find({ userId: req.user.id })
        .populate('pdfId', 'originalName')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: bookmarks.length,
        data: bookmarks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Get bookmarks by tag
router.get('/tag/:tag',
  authMiddleware,
  async (req, res) => {
    try {
      const bookmarks = await Bookmark.find({
        userId: req.user.id,
        tags: req.params.tag
      }).populate('pdfId', 'originalName').sort({ createdAt: -1 });

      res.json({
        success: true,
        tag: req.params.tag,
        count: bookmarks.length,
        data: bookmarks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Update bookmark
router.put('/:bookmarkId',
  authMiddleware,
  body('tags').optional().isArray(),
  body('notes').optional().isLength({ max: 500 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const bookmark = await Bookmark.findOneAndUpdate(
        { _id: req.params.bookmarkId, userId: req.user.id },
        req.body,
        { new: true }
      );

      if (!bookmark) {
        return res.status(404).json({
          success: false,
          error: 'Bookmark not found'
        });
      }

      res.json({
        success: true,
        message: 'Bookmark updated successfully',
        data: bookmark
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Delete bookmark
router.delete('/:bookmarkId',
  authMiddleware,
  async (req, res) => {
    try {
      const bookmark = await Bookmark.findOneAndDelete({
        _id: req.params.bookmarkId,
        userId: req.user.id
      });

      if (!bookmark) {
        return res.status(404).json({
          success: false,
          error: 'Bookmark not found'
        });
      }

      res.json({
        success: true,
        message: 'Bookmark deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

module.exports = router;
