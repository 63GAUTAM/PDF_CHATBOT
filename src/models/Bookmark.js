const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
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
  tags: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    maxlength: 500
  },
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pdf'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

BookmarkSchema.index({ userId: 1, createdAt: -1 });
BookmarkSchema.index({ tags: 1 });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
