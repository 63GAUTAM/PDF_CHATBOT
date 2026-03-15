const Chat = require('../models/Chat');
const Pdf = require('../models/Pdf');
const aiService = require('./aiService');

class ChatService {
  /**
   * Save a chat message for multiple PDFs
   */
  static async saveChatMessage(pdfIds, sessionId, question, answer) {
    try {
      let chat = await Chat.findOne({ sessionId });

      if (!chat) {
        chat = new Chat({
          pdfIds,
          sessionId,
          messages: []
        });
      }

      chat.messages.push({
        question,
        answer,
        confidence: 0.8
      });

      await chat.save();
      return chat;
    } catch (error) {
      throw new Error(`Failed to save chat message: ${error.message}`);
    }
  }

  /**
   * Get chat history for a session
   */
  static async getChatHistory(sessionId) {
    try {
      const chat = await Chat.findOne({ sessionId }).populate('pdfIds');
      if (!chat) {
        return { messages: [], predictedQuestions: [] };
      }
      return chat;
    } catch (error) {
      throw new Error(`Failed to get chat history: ${error.message}`);
    }
  }

  /**
   * Process a user question with multiple PDFs
   */
  static async processQuestion(pdfIds, sessionId, question) {
    try {
      // Validate pdfIds is array
      if (!Array.isArray(pdfIds) || pdfIds.length === 0) {
        throw new Error('At least one PDF ID is required');
      }

      // Get all PDF contents
      const pdfContents = [];
      const pdfTitles = [];

      for (const pdfId of pdfIds) {
        const pdf = await Pdf.findById(pdfId);
        if (pdf) {
          pdfContents.push(pdf.content);
          pdfTitles.push(pdf.originalName);
        }
      }

      if (pdfContents.length === 0) {
        throw new Error('No PDFs found');
      }

      // Generate answer using AI (handles single or multiple PDFs)
      let answer;
      if (pdfContents.length === 1) {
        answer = await aiService.answerQuestion(question, pdfContents[0]);
      } else {
        answer = await aiService.answerQuestionMultiplePdfs(question, pdfContents, pdfTitles);
      }

      // Save the chat message
      await this.saveChatMessage(pdfIds, sessionId, question, answer);

      return {
        question,
        answer,
        pdfIds,
        pdfCount: pdfIds.length,
        sessionId
      };
    } catch (error) {
      throw new Error(`Failed to process question: ${error.message}`);
    }
  }

  /**
   * Save predicted questions to session
   */
  static async savePredictedQuestions(pdfIds, sessionId, questions) {
    try {
      let chat = await Chat.findOne({ sessionId });

      if (!chat) {
        chat = new Chat({
          pdfIds,
          sessionId,
          messages: [],
          predictedQuestions: questions
        });
      } else {
        chat.predictedQuestions = questions;
      }

      await chat.save();
      return chat;
    } catch (error) {
      throw new Error(`Failed to save predicted questions: ${error.message}`);
    }
  }

  /**
   * Clear chat history for a session
   */
  static async clearChatHistory(sessionId) {
    try {
      const result = await Chat.deleteOne({ sessionId });
      return result;
    } catch (error) {
      throw new Error(`Failed to clear chat history: ${error.message}`);
    }
  }

  /**
   * Get all sessions
   */
  static async getAllSessions() {
    try {
      const sessions = await Chat.find({}, 'sessionId pdfIds createdAt updatedAt').populate('pdfIds', 'originalName');
      return sessions;
    } catch (error) {
      throw new Error(`Failed to get sessions: ${error.message}`);
    }
  }
}

module.exports = ChatService;
