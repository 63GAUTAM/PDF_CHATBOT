const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  /**
   * Register a new user
   */
  static async registerUser(username, email, password, displayName) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        displayName: displayName || username
      });

      await user.save();

      return {
        userId: user._id,
        username: user.username,
        email: user.email,
        message: 'User registered successfully'
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Login user
   */
  static async loginUser(email, password) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return {
        token,
        user: user.toJSON(),
        message: 'Login successful'
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return user.toJSON();
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updates) {
    try {
      const allowedUpdates = ['displayName', 'profilePicture', 'preferences'];
      
      const filteredUpdates = {};
      allowedUpdates.forEach(field => {
        if (updates[field]) {
          filteredUpdates[field] = updates[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        filteredUpdates,
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user.toJSON();
    } catch (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  /**
   * Check and reset API quota if needed
   */
  static async checkAndUpdateQuota(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Reset daily quota if date has changed
      if (user.apiQuota.resetDate < today) {
        user.apiQuota.currentDayUsage = 0;
        user.apiQuota.resetDate = new Date();
      }

      // Check quotas
      const dayQuotaExceeded = user.apiQuota.currentDayUsage >= user.apiQuota.dailyRequests;
      const monthQuotaExceeded = user.apiQuota.currentMonthUsage >= user.apiQuota.monthlyRequests;

      await user.save();

      return {
        quotaExceeded: dayQuotaExceeded || monthQuotaExceeded,
        dayQuotaExceeded,
        monthQuotaExceeded,
        dayUsage: user.apiQuota.currentDayUsage,
        dayLimit: user.apiQuota.dailyRequests,
        monthUsage: user.apiQuota.currentMonthUsage,
        monthLimit: user.apiQuota.monthlyRequests
      };
    } catch (error) {
      throw new Error(`Failed to check quota: ${error.message}`);
    }
  }

  /**
   * Increment API usage
   */
  static async incrementUsage(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      user.apiQuota.currentDayUsage += 1;
      user.apiQuota.currentMonthUsage += 1;

      await user.save();

      return {
        dayUsage: user.apiQuota.currentDayUsage,
        monthUsage: user.apiQuota.currentMonthUsage
      };
    } catch (error) {
      throw new Error(`Failed to update usage: ${error.message}`);
    }
  }
}

module.exports = AuthService;
