const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Send conversation summary via email
   */
  async sendConversationSummary(email, sessionId, conversationTitle, messageCount, summary) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Conversation Summary: ${conversationTitle}`,
        html: `
          <h2>Conversation Summary</h2>
          <p><strong>Session:</strong> ${sessionId}</p>
          <p><strong>Title:</strong> ${conversationTitle}</p>
          <p><strong>Messages:</strong> ${messageCount}</p>
          <hr>
          <h3>Summary:</h3>
          <p>${summary}</p>
          <hr>
          <p>Log in to view the full conversation.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, username) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to PDF Chatbot!',
        html: `
          <h2>Welcome, ${username}!</h2>
          <p>Thank you for joining PDF Chatbot.</p>
          <p>You can now:</p>
          <ul>
            <li>Upload and analyze PDF documents</li>
            <li>Ask questions about your documents</li>
            <li>Generate practice questions</li>
            <li>Share conversations with others</li>
          </ul>
          <p>Happy analyzing!</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Welcome email error:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  /**
   * Send bookmark notification
   */
  async sendBookmarkNotification(email, username, bookmarkCount) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'You have bookmarked an important Q&A',
        html: `
          <h2>New Bookmark</h2>
          <p>Hi ${username},</p>
          <p>You now have ${bookmarkCount} bookmarked Q&A pairs.</p>
          <p>Log in to view and manage your bookmarks.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Bookmark notification error:', error);
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * Send conversation shared notification
   */
  async sendShareNotification(email, sharerName, sessionTitle) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `${sharerName} shared a conversation with you`,
        html: `
          <h2>Shared Conversation</h2>
          <p>${sharerName} shared a conversation titled "${sessionTitle}" with you.</p>
          <p><a href="${process.env.FRONTEND_URL}/shared">View Shared Conversation</a></p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Share notification error:', error);
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
