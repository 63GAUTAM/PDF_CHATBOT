const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ExportService {
  /**
   * Export conversation as JSON
   */
  static async exportAsJSON(chat) {
    try {
      const exportData = {
        sessionId: chat.sessionId,
        pdfNames: chat.pdfIds.map(pdf => pdf.originalName || pdf._id),
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messageCount: chat.messages.length,
        messages: chat.messages.map((msg, index) => ({
          id: index + 1,
          question: msg.question,
          answer: msg.answer,
          timestamp: msg.createdAt,
          confidence: msg.confidence || 0.8
        })),
        predictedQuestions: chat.predictedQuestions || []
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Failed to export as JSON: ${error.message}`);
    }
  }

  /**
   * Export conversation as PDF
   */
  static async exportAsPDF(chat, outputPath = null) {
    try {
      const doc = new PDFDocument();

      if (!outputPath) {
        outputPath = path.join(__dirname, `../../exports/conversation-${chat.sessionId}.pdf`);
        // Ensure exports directory exists
        const exportsDir = path.dirname(outputPath);
        if (!fs.existsSync(exportsDir)) {
          fs.mkdirSync(exportsDir, { recursive: true });
        }
      }

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Conversation Export', { align: 'center' });
      doc.fontSize(12).text(`Session ID: ${chat.sessionId}`, { align: 'center' });
      doc.fontSize(10).text(`Exported: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();

      // PDFs used
      doc.fontSize(12).font('Helvetica-Bold').text('Documents Used:');
      doc.fontSize(10).font('Helvetica');
      chat.pdfIds.forEach(pdf => {
        doc.text(`• ${pdf.originalName || pdf._id}`);
      });
      doc.moveDown();

      // Messages
      doc.fontSize(12).font('Helvetica-Bold').text('Conversation:');
      doc.fontSize(10).font('Helvetica');

      chat.messages.forEach((msg, index) => {
        doc.fontSize(11).font('Helvetica-Bold').text(`Q${index + 1}: ${msg.question}`);
        doc.fontSize(10).font('Helvetica').text(msg.answer, {
          width: 500,
          align: 'left'
        });
        doc.moveDown(0.5);
      });

      // Predicted questions
      if (chat.predictedQuestions && chat.predictedQuestions.length > 0) {
        doc.addPage();
        doc.fontSize(12).font('Helvetica-Bold').text('Predicted Questions:');
        doc.fontSize(10).font('Helvetica');
        chat.predictedQuestions.forEach((q, index) => {
          doc.text(`${index + 1}. ${q}`);
        });
      }

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to export as PDF: ${error.message}`);
    }
  }

  /**
   * Export conversation as CSV
   */
  static async exportAsCSV(chat) {
    try {
      let csv = 'Question,Answer,Timestamp,Confidence\n';

      chat.messages.forEach(msg => {
        const question = `"${(msg.question || '').replace(/"/g, '""')}"`;
        const answer = `"${(msg.answer || '').replace(/"/g, '""')}"`;
        const timestamp = msg.createdAt || new Date();
        const confidence = msg.confidence || 0.8;

        csv += `${question},${answer},${timestamp},${confidence}\n`;
      });

      return csv;
    } catch (error) {
      throw new Error(`Failed to export as CSV: ${error.message}`);
    }
  }

  /**
   * Export conversation as Markdown
   */
  static async exportAsMarkdown(chat) {
    try {
      let markdown = `# Conversation Export\n\n`;
      markdown += `**Session ID:** ${chat.sessionId}\n`;
      markdown += `**Created:** ${chat.createdAt}\n`;
      markdown += `**Updated:** ${chat.updatedAt}\n\n`;

      markdown += `## Documents Used\n`;
      chat.pdfIds.forEach(pdf => {
        markdown += `- ${pdf.originalName || pdf._id}\n`;
      });
      markdown += '\n';

      markdown += `## Conversation\n\n`;
      chat.messages.forEach((msg, index) => {
        markdown += `### Q${index + 1}: ${msg.question}\n\n`;
        markdown += `${msg.answer}\n\n`;
      });

      if (chat.predictedQuestions && chat.predictedQuestions.length > 0) {
        markdown += `## Predicted Questions\n\n`;
        chat.predictedQuestions.forEach((q, index) => {
          markdown += `${index + 1}. ${q}\n`;
        });
      }

      return markdown;
    } catch (error) {
      throw new Error(`Failed to export as Markdown: ${error.message}`);
    }
  }
}

module.exports = ExportService;
