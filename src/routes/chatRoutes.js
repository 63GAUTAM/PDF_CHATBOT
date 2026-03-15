const express = require('express');
const router = express.Router();
const ChatService = require('../services/chatService');
const aiService = require('../services/aiService');
const PdfService = require('../services/pdfService');
const { body, validationResult } = require('express-validator');

// Ask a question about one or multiple PDFs
router.post('/ask', 
  body('pdfIds').isArray().withMessage('PDF IDs must be an array'),
  body('question').notEmpty().withMessage('Question is required'),
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { pdfIds, question, sessionId } = req.body;

      const result = await ChatService.processQuestion(pdfIds, sessionId, question);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Generate predicted questions from PDFs
router.post('/predict-questions',
  body('pdfIds').isArray().withMessage('PDF IDs must be an array'),
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('numQuestions').optional().isInt({ min: 1, max: 10 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { pdfIds, sessionId, numQuestions = 5 } = req.body;
      
      console.log('Predict request - pdfIds:', pdfIds, 'sessionId:', sessionId);

      // Check if we have PDFs
      if (!pdfIds || pdfIds.length === 0) {
        return res.status(400).json({ error: 'No PDF IDs provided' });
      }

      // Fetch all PDFs and combine their content
      let combinedContent = '';
      const pdfTitles = [];
      let fetchedCount = 0;

      for (const pdfId of pdfIds) {
        try {
          console.log('Fetching PDF:', pdfId);
          const pdf = await PdfService.getPdfById(pdfId);
          console.log('PDF fetched:', pdf.originalName, 'content length:', pdf.content.length);
          combinedContent += `\n\n=== ${pdf.originalName} ===\n${pdf.content}`;
          pdfTitles.push(pdf.originalName);
          fetchedCount++;
        } catch (error) {
          console.error(`Could not fetch PDF ${pdfId}:`, error.message);
        }
      }

      console.log('Fetched', fetchedCount, 'PDFs, combined content length:', combinedContent.length);

      if (!combinedContent.trim()) {
        return res.status(400).json({ error: 'No PDF content found. Could not fetch any of the provided PDFs.' });
      }

      console.log('Generating predicted questions...');
      // Generate predicted questions
      const predictedQuestions = await aiService.generatePredictedQuestions(combinedContent, numQuestions);

      console.log('Generated', predictedQuestions.length, 'questions');

      // Save to chat history
      await ChatService.savePredictedQuestions(pdfIds, sessionId, predictedQuestions);

      res.json({
        success: true,
        data: {
          predictedQuestions,
          pdfCount: pdfIds.length,
          fetchedCount: fetchedCount,
          titles: pdfTitles
        }
      });
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate predicted questions' });
    }
  }
);

// Get chat history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chat = await ChatService.getChatHistory(sessionId);

    res.json({
      messages: chat.messages || [],
      predictedQuestions: chat.predictedQuestions || [],
      sessionId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear chat history
router.delete('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    await ChatService.clearChatHistory(sessionId);

    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await ChatService.getAllSessions();

    res.json({
      sessions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
