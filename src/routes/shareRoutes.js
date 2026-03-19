const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ConversationShare = require('../models/ConversationShare');
const Chat = require('../models/Chat');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// Create a share link
router.post('/',
  authMiddleware,
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('isPublic').optional().isBoolean(),
  body('allowEdit').optional().isBoolean(),
  body('sharedEmails').optional().isArray(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const chat = await Chat.findOne({ sessionId: req.body.sessionId });
      if (!chat) {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }

      const shareCode = crypto.randomBytes(16).toString('hex');

      const share = new ConversationShare({
        sessionId: req.body.sessionId,
        ownerId: req.user.id,
        shareCode,
        isPublic: req.body.isPublic || false,
        allowEdit: req.body.allowEdit || false,
        sharedWith: []
      });

      // Share with specific emails
      if (req.body.sharedEmails && Array.isArray(req.body.sharedEmails)) {
        for (const email of req.body.sharedEmails) {
          share.sharedWith.push({ email });

          // Send email notification (non-blocking)
          const owner = await User.findById(req.user.id);
          emailService.sendShareNotification(email, owner.displayName || owner.username, req.body.sessionId)
            .catch(err => console.error('Share notification failed:', err.message));
        }
      }

      await share.save();

      res.status(201).json({
        success: true,
        message: 'Conversation shared successfully',
        data: {
          shareCode,
          shareLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareCode}`,
          isPublic: share.isPublic
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

// Get shared conversation by code
router.get('/code/:shareCode', async (req, res) => {
  try {
    const share = await ConversationShare.findOne({
      shareCode: req.params.shareCode,
      expiresAt: { $gt: new Date() }
    }).populate('ownerId', 'displayName username');

    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Share link not found or expired'
      });
    }

    // Increment view count
    share.viewCount += 1;
    await share.save();

    const chat = await Chat.findOne({ sessionId: share.sessionId })
      .populate('pdfIds', 'originalName');

    res.json({
      success: true,
      owner: share.ownerId,
      conversation: chat,
      viewCount: share.viewCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get my shares
router.get('/',
  authMiddleware,
  async (req, res) => {
    try {
      const shares = await ConversationShare.find({ ownerId: req.user.id })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: shares.length,
        data: shares
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Update share permissions
router.put('/:shareId',
  authMiddleware,
  body('isPublic').optional().isBoolean(),
  body('allowEdit').optional().isBoolean(),
  async (req, res) => {
    try {
      const share = await ConversationShare.findOneAndUpdate(
        { _id: req.params.shareId, ownerId: req.user.id },
        req.body,
        { new: true }
      );

      if (!share) {
        return res.status(404).json({
          success: false,
          error: 'Share not found'
        });
      }

      res.json({
        success: true,
        message: 'Share updated successfully',
        data: share
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Delete share
router.delete('/:shareId',
  authMiddleware,
  async (req, res) => {
    try {
      const share = await ConversationShare.findOneAndDelete({
        _id: req.params.shareId,
        ownerId: req.user.id
      });

      if (!share) {
        return res.status(404).json({
          success: false,
          error: 'Share not found'
        });
      }

      res.json({
        success: true,
        message: 'Share link deleted'
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
