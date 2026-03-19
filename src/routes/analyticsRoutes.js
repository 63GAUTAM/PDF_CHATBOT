const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const AnalyticsService = require('../services/analyticsService');
const authMiddleware = require('../middleware/authMiddleware');

// Get user analytics for date range
router.get('/user',
  authMiddleware,
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

      const analytics = await AnalyticsService.getUserAnalytics(req.user.id, startDate, endDate);

      res.json({
        success: true,
        dateRange: {
          start: startDate,
          end: endDate
        },
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Get global analytics (admin only)
router.get('/global',
  authMiddleware,
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  async (req, res) => {
    try {
      // Check if user is admin (you can add role checking here)
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      const analytics = await AnalyticsService.getGlobalAnalytics(startDate, endDate);

      res.json({
        success: true,
        dateRange: {
          start: startDate,
          end: endDate
        },
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Get dashboard summary
router.get('/summary',
  authMiddleware,
  async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAnalytics = await AnalyticsService.getUserAnalytics(req.user.id, today, tomorrow);

      res.json({
        success: true,
        summary: {
          todayQuestions: todayAnalytics.totalQuestions || 0,
          todayAnswers: todayAnalytics.totalAnswers || 0,
          todayUploads: todayAnalytics.totalPdfUploads || 0,
          todayApiCalls: todayAnalytics.totalApiCalls || 0,
          averageQuality: todayAnalytics.averageQuality || 0
        }
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
