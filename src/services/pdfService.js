const fs = require('fs');
const path = require('path');
const Pdf = require('../models/Pdf');
const pdfParse = require('pdf-parse');

class PdfService {
  /**
   * Extract text from a PDF file
   */
  static async extractTextFromPdf(filePath) {
    try {
      console.log('Extracting PDF from:', filePath);
      const pdfBuffer = fs.readFileSync(filePath);
      console.log('PDF buffer size:', pdfBuffer.length);
      
      console.log('Parsing PDF...');
      const data = await pdfParse(pdfBuffer);
      console.log('PDF parsed successfully, pages:', data.numpages);
      
      return {
        text: data.text || '',
        pages: data.numpages || 0,
        info: data.info || {}
      };
    } catch (error) {
      console.error('PDF extraction error:', error.message);
      throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
  }

  /**
   * Save PDF to database
   */
  static async savePdf(file, content, summary = null) {
    try {
      const pdf = new Pdf({
        filename: file.filename,
        originalName: file.originalname,
        filepath: file.path,
        filesize: file.size,
        mimeType: file.mimetype,
        content: content,
        summary: summary,
        pages: 0
      });

      await pdf.save();
      return pdf;
    } catch (error) {
      throw new Error(`Failed to save PDF to database: ${error.message}`);
    }
  }

  /**
   * Get PDF by ID
   */
  static async getPdfById(pdfId) {
    try {
      const pdf = await Pdf.findById(pdfId);
      if (!pdf) {
        throw new Error('PDF not found');
      }
      return pdf;
    } catch (error) {
      throw new Error(`Failed to get PDF: ${error.message}`);
    }
  }

  /**
   * Get all PDFs
   */
  static async getAllPdfs(limit = 10, skip = 0) {
    try {
      const pdfs = await Pdf.find()
        .limit(limit)
        .skip(skip)
        .sort({ uploadedAt: -1 });
      
      const total = await Pdf.countDocuments();
      
      return { pdfs, total };
    } catch (error) {
      throw new Error(`Failed to get PDFs: ${error.message}`);
    }
  }

  /**
   * Delete PDF by ID
   */
  static async deletePdf(pdfId) {
    try {
      const pdf = await Pdf.findByIdAndDelete(pdfId);
      if (!pdf) {
        throw new Error('PDF not found');
      }

      // Delete file from filesystem
      if (fs.existsSync(pdf.filepath)) {
        fs.unlinkSync(pdf.filepath);
      }

      return pdf;
    } catch (error) {
      throw new Error(`Failed to delete PDF: ${error.message}`);
    }
  }

  /**
   * Update PDF summary
   */
  static async updatePdfSummary(pdfId, summary) {
    try {
      const pdf = await Pdf.findByIdAndUpdate(
        pdfId,
        { summary: summary, updatedAt: Date.now() },
        { new: true }
      );
      
      if (!pdf) {
        throw new Error('PDF not found');
      }
      
      return pdf;
    } catch (error) {
      throw new Error(`Failed to update PDF summary: ${error.message}`);
    }
  }

  /**
   * Search PDFs by filename
   */
  static async searchPdfs(query, limit = 10) {
    try {
      const pdfs = await Pdf.find({
        $or: [
          { filename: { $regex: query, $options: 'i' } },
          { originalName: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(limit)
      .sort({ uploadedAt: -1 });

      return pdfs;
    } catch (error) {
      throw new Error(`Failed to search PDFs: ${error.message}`);
    }
  }
}

module.exports = PdfService;
