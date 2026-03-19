const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/authService');
const emailService = require('../services/emailService');
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

// Register
router.post('/register', 
  authLimiter,
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').optional().trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, displayName } = req.body;

      const result = await AuthService.registerUser(username, email, password, displayName);

      // Send welcome email (non-blocking)
      emailService.sendWelcomeEmail(email, username).catch(err => {
        console.error('Welcome email failed:', err.message);
      });

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          userId: result.userId,
          username: result.username,
          email: result.email
        }
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }
);

// Login
router.post('/login',
  authLimiter,
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const result = await AuthService.loginUser(email, password);

      res.json({
        success: true,
        message: result.message,
        token: result.token,
        user: result.user
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await AuthService.getUserById(req.user.id);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', 
  authMiddleware,
  body('displayName').optional().trim(),
  body('preferences.theme').optional().isIn(['light', 'dark']),
  body('preferences.emailNotifications').optional().isBoolean(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updatedUser = await AuthService.updateUserProfile(req.user.id, req.body);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Check quota
router.get('/quota', authMiddleware, async (req, res) => {
  try {
    const quotaStatus = await AuthService.checkAndUpdateQuota(req.user.id);

    res.json({
      success: true,
      quota: quotaStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
