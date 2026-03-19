const mongoose = require('mongoose');

const ConversationShareSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shareCode: {
    type: String,
    unique: true,
    required: true
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  allowEdit: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ConversationShareSchema.index({ ownerId: 1, createdAt: -1 });
ConversationShareSchema.index({ shareCode: 1 });

module.exports = mongoose.model('ConversationShare', ConversationShareSchema);
