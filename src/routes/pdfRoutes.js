const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const PdfService = require('../services/pdfService');
const aiService = require('../services/aiService');
const { body, validationResult } = require('express-validator');

// Upload PDF with error handling
router.post('/upload', (req, res, next) => {
  upload.single('pdf')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file ? req.file.originalname : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('Extracting text from PDF...');
    // Extract text from PDF
    const { text, pages } = await PdfService.extractTextFromPdf(req.file.path);
    console.log('Text extracted, length:', text.length);

    // Generate summary (disabled for testing)
    let summary = null;
    // try {
    //   summary = await aiService.generateSummary(text);
    // } catch (summaryError) {
    //   console.warn('Summary generation failed:', summaryError.message);
    // }

    console.log('Saving PDF to database...');
    // Save PDF to database
    const pdf = await PdfService.savePdf(req.file, text, summary);
    pdf.pages = pages;
    await pdf.save();
    console.log('PDF saved, ID:', pdf._id);

    res.status(201).json({
      success: true,
      message: 'PDF uploaded successfully',
      pdfId: pdf._id,
      filename: pdf.originalName,
      pages: pages,
      summary: summary
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get PDF details
router.get('/:pdfId', async (req, res) => {
  try {
    const pdf = await PdfService.getPdfById(req.params.pdfId);
    res.json({
      _id: pdf._id,
      filename: pdf.originalName,
      pages: pdf.pages,
      summary: pdf.summary,
      uploadedAt: pdf.uploadedAt,
      filesize: pdf.filesize
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get all PDFs
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const { pdfs, total } = await PdfService.getAllPdfs(limit, skip);

    res.json({
      pdfs: pdfs.map(pdf => ({
        _id: pdf._id,
        filename: pdf.originalName,
        pages: pdf.pages,
        summary: pdf.summary,
        uploadedAt: pdf.uploadedAt,
        filesize: pdf.filesize
      })),
      total,
      limit,
      skip
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete PDF
router.delete('/:pdfId', async (req, res) => {
  try {
    const pdf = await PdfService.deletePdf(req.params.pdfId);
    res.json({ success: true, message: 'PDF deleted successfully' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Search PDFs
router.get('/search/:query', async (req, res) => {
  try {
    const pdfs = await PdfService.searchPdfs(req.params.query);
    res.json({
      pdfs: pdfs.map(pdf => ({
        _id: pdf._id,
        filename: pdf.originalName,
        pages: pdf.pages,
        uploadedAt: pdf.uploadedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
