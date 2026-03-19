const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const PdfService = require('../services/pdfService');
const aiService = require('../services/aiService');
const Chat = require('../models/Chat');
const { body, validationResult } = require('express-validator');

// Upload single PDF with error handling
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

    console.log('Extracting text from file...');
    // Extract text from file (PDF, Excel, or Word)
    const { text, pages } = await PdfService.extractTextFromFile(req.file.path, req.file.mimetype);
    console.log('Text extracted, length:', text.length);

    // Generate summary (disabled for testing)
    let summary = null;
    // try {
    //   summary = await aiService.generateSummary(text);
    // } catch (summaryError) {
    //   console.warn('Summary generation failed:', summaryError.message);
    // }

    console.log('Saving document to database...');
    // Save document to database
    const pdf = await PdfService.savePdf(req.file, text, summary);
    pdf.pages = pages;
    await pdf.save();
    console.log('Document saved, ID:', pdf._id);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
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

// Batch upload multiple PDFs
router.post('/upload-batch', (req, res, next) => {
  upload.array('pdfs', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const uploadedPdfs = [];
    const errors = [];

    for (const file of req.files) {
      try {
        console.log(`Processing file: ${file.originalname}`);
        
        const { text, pages } = await PdfService.extractTextFromFile(file.path, file.mimetype);
        let summary = null;

        const pdf = await PdfService.savePdf(file, text, summary);
        pdf.pages = pages;
        await pdf.save();

        uploadedPdfs.push({
          pdfId: pdf._id,
          filename: pdf.originalName,
          pages: pages,
          status: 'success'
        });

      } catch (fileError) {
        console.error(`Error processing ${file.originalname}:`, fileError);
        errors.push({
          filename: file.originalname,
          error: fileError.message,
          status: 'failed'
        });
      }
    }

    res.status(201).json({
      success: uploadedPdfs.length > 0,
      message: `${uploadedPdfs.length} file(s) uploaded successfully`,
      uploadedPdfs,
      failedPdfs: errors,
      totalAttempted: req.files.length,
      successCount: uploadedPdfs.length,
      failureCount: errors.length
    });
  } catch (error) {
    console.error('Batch upload error:', error);
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
