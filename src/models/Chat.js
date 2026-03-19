const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  pdfIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pdf',
    required: true
  }],
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: null
  },
  description: {
    type: String,
    maxlength: 500,
    default: null
  },
  messages: [messageSchema],
  predictedQuestions: [{
    type: String
  }],
  isBookmarked: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for querying chats by session
chatSchema.index({ sessionId: 1 });
chatSchema.index({ pdfIds: 1, sessionId: 1 });

module.exports = mongoose.model('Chat', chatSchema);
