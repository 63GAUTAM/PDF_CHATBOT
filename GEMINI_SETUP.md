# Google Gemini Integration Guide

## What's Already Done ✅
Your PDF chatbot is **already integrated with Google Gemini**! The following features are implemented:

### Gemini Features Included:
1. **PDF Summarization** - Automatically generate concise summaries of PDF content
2. **Q&A System** - Ask questions about PDF documents and get AI-powered answers
3. **Multiple PDF Support** - Ask questions across multiple PDFs simultaneously
4. **Key Information Extraction** - Extract important points from documents
5. **Predicted Questions** - Generate practice exam questions from study materials

---

## Setup Instructions

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Click **"Create API Key"**
3. Select **"Create API key in new project"** or use existing project
4. Copy the API key

### Step 2: Configure Environment Variables

1. Create a `.env` file in the project root (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
MONGODB_URI=mongodb://localhost:27017/pdf-chatbot
PORT=5000
NODE_ENV=development
```

### Step 3: Install Dependencies

```bash
npm install
```

The required package `@google/generative-ai` is already in `package.json`

### Step 4: Ensure MongoDB is Running

```bash
# On Windows with MongoDB installed:
mongod
```

Or use MongoDB Atlas (cloud):
- Update `MONGODB_URI` in `.env` with your Atlas connection string

### Step 5: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

The server will run on `http://localhost:5000`

---

## API Endpoints

### 1. Upload PDF
```bash
POST /api/pdf/upload
Content-Type: multipart/form-data

Body: file (PDF, DOCX, or XLSX file)
```

**Response:**
```json
{
  "success": true,
  "pdfId": "507f1f77bcf86cd799439011",
  "filename": "document.pdf",
  "summary": "AI-generated summary..."
}
```

### 2. Ask a Question
```bash
POST /api/chat/ask

Body:
{
  "pdfIds": ["507f1f77bcf86cd799439011"],
  "question": "What is this document about?",
  "sessionId": "session-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "What is this document about?",
    "answer": "Based on the document, ...",
    "pdfIds": ["507f1f77bcf86cd799439011"],
    "pdfCount": 1,
    "sessionId": "session-123"
  }
}
```

### 3. Generate Practice Questions
```bash
POST /api/chat/predict-questions

Body:
{
  "pdfIds": ["507f1f77bcf86cd799439011"],
  "sessionId": "session-123",
  "numQuestions": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictedQuestions": [
      "Question 1?",
      "Question 2?",
      "Question 3?",
      "Question 4?",
      "Question 5?"
    ],
    "pdfCount": 1,
    "fetchedCount": 1,
    "titles": ["document.pdf"]
  }
}
```

### 4. Get Chat History
```bash
GET /api/chat/history/:sessionId
```

### 5. Clear Chat History
```bash
DELETE /api/chat/history/:sessionId
```

### 6. List All PDFs
```bash
GET /api/pdf
```

---

## Testing with cURL/Postman

### Test Upload:
```bash
curl -X POST http://localhost:5000/api/pdf/upload \
  -F "file=@/path/to/document.pdf"
```

### Test Q&A:
```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "pdfIds": ["YOUR_PDF_ID"],
    "question": "What is the main topic?",
    "sessionId": "test-session"
  }'
```

### Test Predicted Questions:
```bash
curl -X POST http://localhost:5000/api/chat/predict-questions \
  -H "Content-Type: application/json" \
  -d '{
    "pdfIds": ["YOUR_PDF_ID"],
    "sessionId": "test-session",
    "numQuestions": 5
  }'
```

---

## Supported File Types

- **PDF** (.pdf) - Using `pdf-parse`
- **Word Documents** (.docx) - Using `mammoth`
- **Excel Spreadsheets** (.xlsx) - Using `xlsx`

---

## Gemini Models Available

The app uses `gemini-2.5-flash` (latest fast model). You can change it in `src/services/aiService.js`:

```javascript
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash'  // or 'gemini-pro', 'gemini-1.5-flash', etc.
});
```

### Available Models:
- `gemini-2.5-flash` (Latest, fastest)
- `gemini-1.5-pro` (More capable)
- `gemini-1.5-flash` (Fast, efficient)

---

## Troubleshooting

### "GEMINI_API_KEY is not defined"
- Check that `.env` file exists in project root
- Verify the API key is correctly pasted
- Restart the server after updating `.env`

### "MongoDB connection failed"
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas, verify network access is allowed

### "Failed to generate summary/answer"
- Check your API key has sufficient quota
- Verify internet connection
- Check console logs for detailed error messages

### Free Tier Limitations
- Gemini has free tier with rate limits
- For production, consider upgrading to a paid plan
- Monitor API usage in [Google AI Studio](https://aistudio.google.com/app/)

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` to git - it's in `.gitignore`
- Keep your GEMINI_API_KEY secret
- In production, use environment variables from hosting platform

---

## Next Steps

1. ✅ Get your Gemini API key
2. ✅ Configure `.env` file
3. ✅ Start MongoDB
4. ✅ Run `npm install && npm run dev`
5. ✅ Test endpoints with cURL or Postman
6. ✅ Integrate with your frontend

Happy coding! 🚀
