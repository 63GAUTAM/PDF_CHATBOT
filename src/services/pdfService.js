const fs = require('fs');
const path = require('path');
const Pdf = require('../models/Pdf');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const mammoth = require('mammoth');

class PdfService {
  /**
   * Detect file type and extract text accordingly
   */
  static async extractTextFromFile(filePath, mimeType) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.pdf' || mimeType.includes('pdf')) {
        return await this.extractTextFromPdf(filePath);
      } else if (ext === '.xlsx' || ext === '.xls' || mimeType.includes('spreadsheet')) {
        return await this.extractTextFromExcel(filePath);
      } else if (ext === '.docx' || ext === '.doc' || mimeType.includes('wordprocessing')) {
        return await this.extractTextFromWord(filePath);
      } else {
        throw new Error(`Unsupported file format: ${ext}`);
      }
    } catch (error) {
      console.error('File extraction error:', error.message);
      throw error;
    }
  }

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
   * Extract text from an Excel file
   */
  static async extractTextFromExcel(filePath) {
    try {
      console.log('Extracting Excel from:', filePath);
      const workbook = XLSX.readFile(filePath);
      console.log('Excel workbook loaded, sheets:', workbook.SheetNames);
      
      let fullText = '';
      
      // Extract text from all sheets
      for (const sheetName of workbook.SheetNames) {
        fullText += `\n=== Sheet: ${sheetName} ===\n`;
        const worksheet = workbook.Sheets[sheetName];
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        fullText += csvData;
      }
      
      console.log('Excel parsed successfully, text length:', fullText.length);
      
      return {
        text: fullText || '',
        pages: workbook.SheetNames.length || 1,
        info: { sheets: workbook.SheetNames }
      };
    } catch (error) {
      console.error('Excel extraction error:', error.message);
      throw new Error(`Failed to extract Excel text: ${error.message}`);
    }
  }

  /**
   * Extract text from a Word document
   */
  static async extractTextFromWord(filePath) {
    try {
      console.log('Extracting Word document from:', filePath);
      const fileBuffer = fs.readFileSync(filePath);
      
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value || '';
      
      console.log('Word document parsed successfully, text length:', text.length);
      
      return {
        text: text,
        pages: 1,
        info: { warnings: result.messages || [] }
      };
    } catch (error) {
      console.error('Word extraction error:', error.message);
      throw new Error(`Failed to extract Word text: ${error.message}`);
    }
  }

  /**
   * Save document to database
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
      throw new Error(`Failed to save document to database: ${error.message}`);
    }
  }

  /**
   * Get document by ID
   */
  static async getPdfById(pdfId) {
    try {
      const pdf = await Pdf.findById(pdfId);
      if (!pdf) {
        throw new Error('Document not found');
      }
      return pdf;
    } catch (error) {
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  /**
   * Get all documents
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
      throw new Error(`Failed to get documents: ${error.message}`);
    }
  }

  /**
   * Delete document by ID
   */
  static async deletePdf(pdfId) {
    try {
      const pdf = await Pdf.findByIdAndDelete(pdfId);
      if (!pdf) {
        throw new Error('Document not found');
      }

      // Delete file from filesystem
      if (fs.existsSync(pdf.filepath)) {
        fs.unlinkSync(pdf.filepath);
      }

      return pdf;
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Update document summary
   */
  static async updatePdfSummary(pdfId, summary) {
    try {
      const pdf = await Pdf.findByIdAndUpdate(
        pdfId,
        { summary: summary, updatedAt: Date.now() },
        { new: true }
      );
      
      if (!pdf) {
        throw new Error('Document not found');
      }
      
      return pdf;
    } catch (error) {
      throw new Error(`Failed to update document summary: ${error.message}`);
    }
  }

  /**
   * Search documents by filename
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
      throw new Error(`Failed to search documents: ${error.message}`);
    }
  }

  /**
   * Extract text from multiple files and combine
   */
  static async extractMultipleFiles(filePaths, mimeTypes = []) {
    try {
      console.log('Extracting multiple files...');
      let combinedText = '';
      let totalPages = 0;

      for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        const mimeType = mimeTypes[i] || 'application/pdf';
        const fileName = path.basename(filePath);
        
        try {
          const extraction = await this.extractTextFromFile(filePath, mimeType);
          combinedText += `\n\n=== File: ${fileName} ===\n${extraction.text}`;
          totalPages += extraction.pages || 1;
        } catch (error) {
          console.warn(`Failed to extract ${fileName}:`, error.message);
          combinedText += `\n\n=== File: ${fileName} [ERROR] ===\nFailed to extract: ${error.message}`;
        }
      }

      console.log('Multiple files extracted, combined length:', combinedText.length);

      return {
        text: combinedText,
        pages: totalPages,
        fileCount: filePaths.length
      };
    } catch (error) {
      console.error('Multiple file extraction error:', error.message);
      throw new Error(`Failed to extract multiple files: ${error.message}`);
    }
  }
}

module.exports = PdfService;
