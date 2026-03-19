const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const authMiddleware = require('../middleware/authMiddleware');

// Add feedback to a message
router.post('/',
  authMiddleware,
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('messageId').notEmpty().withMessage('Message ID is required'),
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('isHelpful').isBoolean().withMessage('isHelpful must be a boolean'),
  body('comment').optional().isLength({ max: 500 }),
  body('improvement').optional().isIn(['accuracy', 'clarity', 'relevance', 'completeness', 'other']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const feedback = new Feedback({
        userId: req.user.id,
        sessionId: req.body.sessionId,
        messageId: req.body.messageId,
        question: req.body.question,
        answer: req.body.answer,
        rating: req.body.rating,
        isHelpful: req.body.isHelpful,
        comment: req.body.comment,
        improvement: req.body.improvement
      });

      await feedback.save();

      res.status(201).json({
        success: true,
        message: 'Feedback recorded successfully',
        data: feedback
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Get feedback for a session
router.get('/session/:sessionId',
  authMiddleware,
  async (req, res) => {
    try {
      const feedback = await Feedback.find({
        userId: req.user.id,
        sessionId: req.params.sessionId
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        count: feedback.length,
        data: feedback
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Get user feedback statistics
router.get('/stats',
  authMiddleware,
  async (req, res) => {
    try {
      const feedbacks = await Feedback.find({ userId: req.user.id });

      const stats = {
        totalFeedbacks: feedbacks.length,
        averageRating: feedbacks.length > 0 
          ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2)
          : 0,
        helpfulCount: feedbacks.filter(f => f.isHelpful).length,
        unhelpfulCount: feedbacks.filter(f => !f.isHelpful).length,
        improvementSuggestions: {}
      };

      feedbacks.forEach(f => {
        if (f.improvement) {
          stats.improvementSuggestions[f.improvement] = 
            (stats.improvementSuggestions[f.improvement] || 0) + 1;
        }
      });

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Delete feedback
router.delete('/:feedbackId',
  authMiddleware,
  async (req, res) => {
    try {
      const feedback = await Feedback.findOneAndDelete({
        _id: req.params.feedbackId,
        userId: req.user.id
      });

      if (!feedback) {
        return res.status(404).json({
          success: false,
          error: 'Feedback not found'
        });
      }

      res.json({
        success: true,
        message: 'Feedback deleted successfully'
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
