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

  /**
   * Get all conversations with pagination
   */
  static async getAllConversations(limit = 10, skip = 0, sortBy = 'updatedAt') {
    try {
      const total = await Chat.countDocuments();
      
      const conversations = await Chat.find({})
        .populate('pdfIds', 'originalName')
        .sort({ [sortBy]: -1 })
        .limit(limit)
        .skip(skip)
        .select('sessionId pdfIds messages predictedQuestions createdAt updatedAt');

      const formattedConversations = conversations.map(chat => ({
        sessionId: chat.sessionId,
        pdfNames: chat.pdfIds.map(pdf => pdf.originalName),
        messageCount: chat.messages.length,
        lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null,
        hasQuestions: chat.predictedQuestions && chat.predictedQuestions.length > 0,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }));

      return {
        total,
        limit,
        skip,
        conversations: formattedConversations
      };
    } catch (error) {
      throw new Error(`Failed to get conversations: ${error.message}`);
    }
  }

  /**
   * Get detailed chat history with formatted messages
   */
  static async getDetailedChatHistory(sessionId) {
    try {
      const chat = await Chat.findOne({ sessionId }).populate('pdfIds', 'originalName');
      
      if (!chat) {
        return {
          sessionId,
          pdfNames: [],
          messageCount: 0,
          messages: [],
          predictedQuestions: [],
          createdAt: null,
          updatedAt: null
        };
      }

      return {
        sessionId: chat.sessionId,
        pdfNames: chat.pdfIds.map(pdf => pdf.originalName),
        messageCount: chat.messages.length,
        messages: chat.messages.map((msg, index) => ({
          id: `msg-${index}`,
          question: msg.question,
          answer: msg.answer,
          timestamp: msg.createdAt || new Date(),
          confidence: msg.confidence || 0.8
        })),
        predictedQuestions: chat.predictedQuestions || [],
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
    } catch (error) {
      throw new Error(`Failed to get detailed chat history: ${error.message}`);
    }
  }

  /**
   * Search chat history
   */
  static async searchChats(searchQuery, limit = 10) {
    try {
      const chats = await Chat.find({
        $or: [
          { sessionId: { $regex: searchQuery, $options: 'i' } },
          { 'messages.question': { $regex: searchQuery, $options: 'i' } },
          { 'messages.answer': { $regex: searchQuery, $options: 'i' } }
        ]
      })
        .populate('pdfIds', 'originalName')
        .limit(limit)
        .select('sessionId pdfIds messages predictedQuestions createdAt updatedAt');

      return chats.map(chat => ({
        sessionId: chat.sessionId,
        pdfNames: chat.pdfIds.map(pdf => pdf.originalName),
        messageCount: chat.messages.length,
        lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }));
    } catch (error) {
      throw new Error(`Failed to search chats: ${error.message}`);
    }
  }

  /**
   * Get recent conversations
   */
  static async getRecentConversations(limit = 5) {
    try {
      const conversations = await Chat.find({})
        .populate('pdfIds', 'originalName')
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select('sessionId pdfIds messages predictedQuestions createdAt updatedAt title isBookmarked tags');

      return conversations.map(chat => ({
        sessionId: chat.sessionId,
        title: chat.title,
        pdfNames: chat.pdfIds.map(pdf => pdf.originalName),
        messageCount: chat.messages.length,
        lastMessage: chat.messages.length > 0 ? {
          question: chat.messages[chat.messages.length - 1].question,
          preview: chat.messages[chat.messages.length - 1].answer.substring(0, 100) + '...',
          timestamp: chat.messages[chat.messages.length - 1].createdAt
        } : null,
        isBookmarked: chat.isBookmarked,
        tags: chat.tags,
        updatedAt: chat.updatedAt
      }));
    } catch (error) {
      throw new Error(`Failed to get recent conversations: ${error.message}`);
    }
  }

  /**
   * Update conversation title
   */
  static async updateConversationTitle(sessionId, title, description = null) {
    try {
      const chat = await Chat.findOneAndUpdate(
        { sessionId },
        { title, description },
        { new: true }
      );

      if (!chat) {
        throw new Error('Conversation not found');
      }

      return chat;
    } catch (error) {
      throw new Error(`Failed to update title: ${error.message}`);
    }
  }

  /**
   * Add tags to conversation
   */
  static async addTagsToConversation(sessionId, tags) {
    try {
      const chat = await Chat.findOne({ sessionId });

      if (!chat) {
        throw new Error('Conversation not found');
      }

      // Merge and deduplicate tags
      const allTags = [...new Set([...chat.tags, ...tags])];
      chat.tags = allTags;

      await chat.save();
      return chat;
    } catch (error) {
      throw new Error(`Failed to add tags: ${error.message}`);
    }
  }

  /**
   * Bookmark a conversation
   */
  static async bookmarkConversation(sessionId) {
    try {
      const chat = await Chat.findOne({ sessionId });

      if (!chat) {
        throw new Error('Conversation not found');
      }

      chat.isBookmarked = !chat.isBookmarked;
      await chat.save();

      return chat;
    } catch (error) {
      throw new Error(`Failed to bookmark conversation: ${error.message}`);
    }
  }

  /**
   * Get bookmarked conversations
   */
  static async getBookmarkedConversations() {
    try {
      const bookmarked = await Chat.find({ isBookmarked: true })
        .populate('pdfIds', 'originalName')
        .sort({ updatedAt: -1 })
        .select('sessionId pdfIds messages title createdAt updatedAt tags');

      return bookmarked.map(chat => ({
        sessionId: chat.sessionId,
        title: chat.title,
        pdfNames: chat.pdfIds.map(pdf => pdf.originalName),
        messageCount: chat.messages.length,
        tags: chat.tags,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }));
    } catch (error) {
      throw new Error(`Failed to get bookmarked conversations: ${error.message}`);
    }
  }
}

module.exports = ChatService;
