const { GoogleGenerativeAI } = require('@google/generative-ai');

class AiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Generate a summary of the PDF content
   */
  async generateSummary(pdfContent, maxLength = 500) {
    try {
      if (!pdfContent || pdfContent.trim().length === 0) {
        throw new Error('PDF content is empty');
      }

      // Truncate content if too long to avoid token limits
      const truncatedContent = pdfContent.substring(0, 3000);

      const prompt = `You are a helpful assistant that summarizes PDF documents concisely. Please summarize the following PDF content in ${maxLength} characters or less:\n\n${truncatedContent}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Answer a question based on PDF content
   */
  async answerQuestion(question, pdfContent, context = '') {
    try {
      if (!question || !pdfContent) {
        throw new Error('Question and PDF content are required');
      }

      // Truncate content to avoid token limits
      const truncatedContent = pdfContent.substring(0, 4000);

      const prompt = `You are a helpful assistant answering questions about PDF documents. Answer only based on the provided document content. If the answer is not in the document, say so clearly.\n\nBased on the following PDF content:\n\n${truncatedContent}\n\nAnswer this question: ${question}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      throw new Error(`Failed to answer question: ${error.message}`);
    }
  }

  /**
   * Extract key information from PDF
   */
  async extractKeyInformation(pdfContent) {
    try {
      const truncatedContent = pdfContent.substring(0, 3000);

      const prompt = `You are a helpful assistant that extracts key information from documents. Extract the key points and important information from this PDF content:\n\n${truncatedContent}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      throw new Error(`Failed to extract key information: ${error.message}`);
    }
  }

  /**
   * Generate predicted questions based on PDF content
   * Used to help students prepare for exams
   */
  async generatePredictedQuestions(pdfContent, numQuestions = 5) {
    try {
      if (!pdfContent || pdfContent.trim().length === 0) {
        throw new Error('PDF content is empty');
      }

      // Truncate content to avoid token limits
      const truncatedContent = pdfContent.substring(0, 5000);

      const prompt = `You are an experienced teacher who creates practice exam questions. Based on the following study material, generate exactly ${numQuestions} likely exam questions that would test understanding of the main concepts. The questions should be realistic and help students prepare for their exams.

Format your response as a numbered list like:
1. First question here?
2. Second question here?
3. Third question here?

Study Material:
${truncatedContent}

Now generate exactly ${numQuestions} realistic exam questions:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini response length:', text.length);
      console.log('Gemini response (first 500 chars):', text.substring(0, 500));
      
      // Parse the response into individual questions - handle multiple formats
      let questions = [];
      
      // Try multiple parsing strategies
      
      // Strategy 1: Match numbered lines with various formats (1. , 1) , 1- , etc.)
      const numberedPattern = /^\s*\d+[\.\)\-]?\s+(.+)$/gm;
      let match;
      const matches = [...text.matchAll(numberedPattern)];
      
      if (matches.length > 0) {
        questions = matches
          .map(m => m[1].trim())
          .filter(q => q.length > 10) // Filter out very short lines
          .slice(0, numQuestions);
      }
      
      // Strategy 2: If no numbered format found, try splitting by newlines and removing empty lines
      if (questions.length === 0) {
        const lines = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 10 && !line.match(/^(Study Material|Generate|format|here|etc\.)/i));
        
        if (lines.length > 0) {
          questions = lines.slice(0, numQuestions);
        }
      }

      console.log('Parsed questions:', questions.length, questions);

      if (questions.length === 0) {
        throw new Error('Could not parse any questions from AI response');
      }

      return questions;
    } catch (error) {
      console.error('Question generation error:', error);
      throw new Error(`Failed to generate predicted questions: ${error.message}`);
    }
  }

  /**
   * Answer a question based on multiple PDF contents
   */
  async answerQuestionMultiplePdfs(question, pdfContents, pdfTitles = []) {
    try {
      if (!question || !pdfContents || pdfContents.length === 0) {
        throw new Error('Question and PDF contents are required');
      }

      // Combine contents from multiple PDFs
      let combinedContent = '';
      pdfContents.forEach((content, index) => {
        const title = pdfTitles[index] || `Document ${index + 1}`;
        combinedContent += `\n=== From ${title} ===\n${content}`;
      });

      // Truncate combined content to avoid token limits
      const truncatedContent = combinedContent.substring(0, 6000);

      const prompt = `You are a helpful assistant answering questions based on multiple study materials. Answer only based on the provided documents. If the answer spans multiple documents, mention which document contains relevant information. If the answer is not in the documents, say so clearly.

Based on the following study materials:
${truncatedContent}

Answer this question: ${question}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      throw new Error(`Failed to answer question: ${error.message}`);
    }
  }
}

module.exports = new AiService();