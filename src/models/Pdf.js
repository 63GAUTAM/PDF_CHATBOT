const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  filesize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    default: 'application/pdf'
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: null
  },
  pages: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    title: String,
    author: String,
    subject: String
  }
}, { timestamps: true });

// Index for faster queries
pdfSchema.index({ filename: 1, uploadedAt: -1 });

module.exports = mongoose.model('Pdf', pdfSchema);
