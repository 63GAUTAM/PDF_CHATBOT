# 🚀 PDF Chatbot - Complete Setup Guide (All 14 Features)

## Summary

Your PDF Chatbot has been successfully enhanced with **14 advanced features**! This guide will help you set everything up and get started.

---

## 📦 What's New?

### ✅ Feature 1: User Authentication
- Create accounts with email/password
- Secure JWT token-based authentication
- User profiles and preferences
- API quota management

### ✅ Feature 2: Chat Feedback System  
- Rate answers 1-5 stars
- Mark helpful/unhelpful responses
- Improvement suggestions
- Feedback analytics

### ✅ Feature 3: Advanced Search
- Full-text search across conversations
- Filter by date range
- Search by PDFs
- Pagination support

### ✅ Feature 4: Conversation Sharing
- Generate shareable links
- Share with specific people via email
- Expire dates and view counts
- Edit permissions

### ✅ Feature 5: Batch PDF Upload
- Upload multiple files at once
- Support for PDF, DOCX, XLSX
- Individual error handling
- Progress tracking

### ✅ Feature 6: Chat Bookmarks
- Save important Q&A pairs
- Organize with tags
- Add personal notes
- Tag-based filtering

### ✅ Feature 7: Conversation Titles
- Custom naming for conversations
- Add descriptions
- Auto-tagging
- Bookmark conversations

### ✅ Feature 8: Analytics Dashboard
- Track user activity
- Daily/monthly statistics
- Popular topics
- Engagement metrics

### ✅ Feature 9: Rate Limiting
- Prevent API abuse
- Per-user quotas
- Configurable limits
- Fair usage enforcement

### ✅ Feature 10: Email Service
- Welcome emails
- Share notifications
- Conversation summaries
- Bookmark alerts

### ✅ Feature 11: Voice Q&A
- Infrastructure ready
- Audio input/output support (framework)
- Extensible architecture

### ✅ Feature 12: Better Error Messages
- User-friendly error responses
- Detailed validation feedback
- Helpful error suggestions
- Error categorization

### ✅ Feature 13: Response Formatting
- Markdown support
- Multiple export formats
- Code highlighting
- HTML rendering

### ✅ Feature 14: Export & Download
- Export as JSON
- Export as PDF
- Export as CSV
- Export as Markdown

---

## 🔧 Installation

### Step 1: Install Dependencies

```bash
cd "f:\pdf chatbot"
npm install
```

This installs:
- `@google/generative-ai` - Gemini AI
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `nodemailer` - Email sending
- `express-rate-limit` - Rate limiting
- `pdfkit` - PDF generation
- `marked` - Markdown parsing
- And 5+ more...

### Step 2: Setup Environment Variables

Create a `.env` file with required values:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pdf-chatbot

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-this

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000

# API Configuration
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=52428800
```

**Get Missing Keys:**

1. **Gemini API Key:** https://aistudio.google.com/app/apikeys
2. **Gmail App Password:** 
   - Enable 2-Factor Authentication
   - Go to https://myaccount.google.com/apppasswords
   - Create "App Password" for Mail

### Step 3: Start MongoDB

```bash
# Check if MongoDB is running
mongosh --ping

# If not running, start it
mongod
```

Or use MongoDB Atlas (Cloud):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pdf-chatbot
```

### Step 4: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Expected output:
```
[INFO] Server running on port 5000
[INFO] MongoDB connected successfully
```

---

## 🧪 Testing the APIs

### Test 1: Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123",
    "displayName": "Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### Test 2: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

**Response includes JWT token** - save this!

### Test 3: Upload Batch PDFs

```bash
curl -X POST http://localhost:5000/api/pdf/upload-batch \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "pdfs=@file1.pdf" \
  -F "pdfs=@file2.pdf" \
  -F "pdfs=@file3.pdf"
```

### Test 4: Ask Question

```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "pdfIds": ["PDF_ID_1", "PDF_ID_2"],
    "question": "What is the main topic?",
    "sessionId": "session-123"
  }'
```

### Test 5: Provide Feedback

```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "sessionId": "session-123",
    "messageId": "msg-0",
    "question": "What is X?",
    "answer": "X is...",
    "rating": 5,
    "isHelpful": true,
    "comment": "Great answer!",
    "improvement": "clarity"
  }'
```

---

## 📚 Using Postman (Recommended)

### Import Collection

1. Open **Postman**
2. Click **Import**
3. Create requests for each endpoint:

```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
PUT /api/auth/profile
GET /api/auth/quota

POST /api/pdf/upload
POST /api/pdf/upload-batch
GET /api/pdf

POST /api/chat/ask
GET /api/chat/history/:sessionId
GET /api/chat/recent
GET /api/chat/search
PUT /api/chat/session/:sessionId/title
POST /api/chat/session/:sessionId/bookmark

POST /api/feedback
GET /api/feedback/stats

POST /api/bookmarks
GET /api/bookmarks

POST /api/share
GET /api/share/code/:shareCode

GET /api/export/:sessionId/json
GET /api/export/:sessionId/pdf
GET /api/export/:sessionId/csv
GET /api/export/:sessionId/markdown

GET /api/analytics/user
GET /api/analytics/summary
```

### Setup Headers

For all protected endpoints, add:
```
Authorization: Bearer {your_jwt_token}
```

---

## 🗂️ Project Structure

```
pdf-chatbot/
├── src/
│   ├── models/                    # Database schemas
│   │   ├── User.js               # User accounts
│   │   ├── Chat.js               # Conversations
│   │   ├── Pdf.js                # Documents
│   │   ├── Feedback.js           # User feedback
│   │   ├── Bookmark.js           # Bookmarked Q&A
│   │   ├── ConversationShare.js  # Sharing links
│   │   └── Analytics.js          # Usage data
│   │
│   ├── routes/                    # API endpoints
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── pdfRoutes.js          # PDF upload/list
│   │   ├── chatRoutes.js         # Chat Q&A
│   │   ├── feedbackRoutes.js     # Feedback
│   │   ├── bookmarkRoutes.js     # Bookmarks
│   │   ├── shareRoutes.js        # Sharing
│   │   ├── exportRoutes.js       # Export
│   │   └── analyticsRoutes.js    # Analytics
│   │
│   ├── services/                  # Business logic
│   │   ├── authService.js        # Auth logic
│   │   ├── aiService.js          # Gemini AI
│   │   ├── chatService.js        # Chat logic
│   │   ├── pdfService.js         # PDF processing
│   │   ├── emailService.js       # Email sending
│   │   ├── analyticsService.js   # Analytics
│   │   └── exportService.js      # Export formats
│   │
│   ├── middleware/                # Express middleware
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── rateLimitMiddleware.js# Rate limiting
│   │   ├── loggerMiddleware.js   # Request logging
│   │   └── uploadMiddleware.js   # File upload
│   │
│   └── server.js                  # Main server
├── uploads/                       # Uploaded files
├── package.json
├── .env
└── README.md
```

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` in `.env`
- [ ] Use Gmail App Password, not regular password
- [ ] Enable HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Use strong database passwords
- [ ] Enable MongoDB authentication
- [ ] Set proper CORS origins
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Set up firewall rules

---

## 📖 API Documentation

Complete API documentation available in:
- **[COMPLETE_FEATURES.md](COMPLETE_FEATURES.md)** - All 14 features detailed
- **[CHAT_HISTORY_API.md](CHAT_HISTORY_API.md)** - Chat history endpoints
- **[GEMINI_SETUP.md](GEMINI_SETUP.md)** - Gemini AI integration

---

## 🐛 Common Issues & Solutions

### "Cannot find module 'bcryptjs'"
```bash
npm install bcryptjs jsonwebtoken nodemailer express-rate-limit pdfkit marked
```

### "GEMINI_API_KEY is undefined"
- Check `.env` exists in project root
- Verify API key is correctly pasted
- Restart server

### "MongoDB connection refused"
```bash
mongod --dbpath "C:\data\db"
```

### "Email sending failed"
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" in Gmail
- Check EMAIL_USER and EMAIL_PASSWORD

### "Port 5000 already in use"
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID {PID} /F

# Or change PORT in .env
```

---

## 📊 Database Models Summary

### User Model
- Username, Email, Password (hashed)
- Account tier (free, pro, enterprise)
- API quotas (daily/monthly limits)
- Preferences (theme, notifications)

### Chat Model
- Session ID, Messages, Predictions
- **NEW:** Title, Description, Tags
- **NEW:** Bookmark flag

### Feedback Model
- User rating (1-5 stars)
- Helpful/Unhelpful flag
- Improvement suggestions

### Bookmark Model
- Question & Answer pair
- Tags for organization
- Personal notes

### ConversationShare Model
- Share code & link
- Owner & recipients
- Expiration date & view count

### Analytics Model
- Daily activity tracking
- API call counts
- Popular topics

---

## 🚀 Next Steps

1. **Test all endpoints** using the cURL examples above
2. **Review [COMPLETE_FEATURES.md](COMPLETE_FEATURES.md)** for detailed docs
3. **Build a frontend** to consume these APIs
4. **Configure email** for notifications
5. **Set up production** deployment
6. **Monitor analytics** for usage patterns

---

## 📞 Support Endpoints

- **Health Check:** `GET /api/health`
- **User API:** `GET /api/auth/me`
- **Check Quota:** `GET /api/auth/quota`

---

## 🎓 Learning Resources

- [Express.js Guide](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [JWT Authentication](https://jwt.io/)
- [Gemini API](https://aistudio.google.com/)
- [Nodemailer Guide](https://nodemailer.com/)

---

## 📈 Scaling Tips

1. Use MongoDB Atlas for cloud database
2. Add Redis for caching
3. Implement job queues for email/export
4. Use CDN for static files
5. Add database indexing for performance
6. Implement pagination for large datasets
7. Add request logging/monitoring
8. Use environment-specific configs

---

## ✨ All 14 Features Complete!

Your PDF Chatbot now includes:

| # | Feature | Status |
|---|---------|--------|
| 1️⃣ | User Authentication | ✅ Complete |
| 2️⃣ | Chat Feedback System | ✅ Complete |
| 3️⃣ | Advanced Search | ✅ Complete |
| 4️⃣ | Conversation Sharing | ✅ Complete |
| 5️⃣ | Batch PDF Upload | ✅ Complete |
| 6️⃣ | Chat Bookmarks | ✅ Complete |
| 7️⃣ | Conversation Titles | ✅ Complete |
| 8️⃣ | Analytics Dashboard | ✅ Complete |
| 9️⃣ | Rate Limiting | ✅ Complete |
| 🔟 | Email Service | ✅ Complete |
| 1️⃣1️⃣ | Voice Q&A | ✅ Framework Ready |
| 1️⃣2️⃣ | Error Messages | ✅ Complete |
| 1️⃣3️⃣ | Response Formatting | ✅ Complete |
| 1️⃣4️⃣ | Export & Download | ✅ Complete |

---

**Happy coding! 🎉**

Last Updated: March 19, 2024  
Version: 2.0 (All 14 Features)
