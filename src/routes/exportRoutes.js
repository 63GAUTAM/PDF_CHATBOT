const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const ExportService = require('../services/exportService');
const authMiddleware = require('../middleware/authMiddleware');

// Export conversation as JSON
router.get('/:sessionId/json',
  authMiddleware,
  async (req, res) => {
    try {
      const chat = await Chat.findOne({ sessionId: req.params.sessionId })
        .populate('pdfIds', 'originalName');

      if (!chat) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }

      const jsonContent = await ExportService.exportAsJSON(chat);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="conversation-${req.params.sessionId}.json"`);
      res.send(jsonContent);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Export conversation as PDF
router.get('/:sessionId/pdf',
  authMiddleware,
  async (req, res) => {
    try {
      const chat = await Chat.findOne({ sessionId: req.params.sessionId })
        .populate('pdfIds', 'originalName');

      if (!chat) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }

      const pdfPath = await ExportService.exportAsPDF(chat);

      res.download(pdfPath, `conversation-${req.params.sessionId}.pdf`, (err) => {
        if (err) {
          console.error('Download error:', err);
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

// Export conversation as CSV
router.get('/:sessionId/csv',
  authMiddleware,
  async (req, res) => {
    try {
      const chat = await Chat.findOne({ sessionId: req.params.sessionId })
        .populate('pdfIds', 'originalName');

      if (!chat) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }

      const csvContent = await ExportService.exportAsCSV(chat);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="conversation-${req.params.sessionId}.csv"`);
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Export conversation as Markdown
router.get('/:sessionId/markdown',
  authMiddleware,
  async (req, res) => {
    try {
      const chat = await Chat.findOne({ sessionId: req.params.sessionId })
        .populate('pdfIds', 'originalName');

      if (!chat) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }

      const markdownContent = await ExportService.exportAsMarkdown(chat);

      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="conversation-${req.params.sessionId}.md"`);
      res.send(markdownContent);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

module.exports = router;
