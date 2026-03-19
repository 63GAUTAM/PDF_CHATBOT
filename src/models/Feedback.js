const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messageId: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true
  },
  isHelpful: {
    type: Boolean,
    required: true
  },
  comment: {
    type: String,
    maxlength: 500
  },
  improvement: {
    type: String,
    enum: ['accuracy', 'clarity', 'relevance', 'completeness', 'other'],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

FeedbackSchema.index({ userId: 1, sessionId: 1 });
FeedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);
