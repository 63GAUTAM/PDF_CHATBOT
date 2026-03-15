# PDF Chatbot Backend

A Node.js backend for a PDF chatbot application with MongoDB database. Features include PDF upload, summarization, and Q&A capabilities powered by OpenAI.

## Features

- ✅ **PDF Upload & Processing** - Upload PDF files and extract text content
- ✅ **Automatic Summarization** - Generate summaries of PDF documents using AI
- ✅ **Q&A System** - Ask questions about PDF content and get answers
- ✅ **Chat History** - Maintain conversation history per session
- ✅ **Multi-session Support** - Handle multiple chat sessions per PDF
- ✅ **Search** - Search through uploaded PDFs
- ✅ **MongoDB Integration** - Persist data in MongoDB

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **OpenAI API** - For summarization and Q&A
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- OpenAI API Key

### Setup Steps

1. **Clone or extract the project**
   ```bash
   cd pdf-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` with your configuration:
     - `MONGODB_URI` - Your MongoDB connection string
     - `OPENAI_API_KEY` - Your OpenAI API key
     - `PORT` - Server port (default: 5000)

4. **Start MongoDB**
   - If using local MongoDB:
   ```bash
   mongod
   ```
   - Or use MongoDB Atlas cloud service

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

Server will be running at `http://localhost:5000`

## API Endpoints

### PDF Management

#### Upload PDF
- **POST** `/api/pdf/upload`
- **Body**: Form data with `pdf` file
- **Response**: 
  ```json
  {
    "success": true,
    "pdfId": "60d5ec49c1234567890abc12",
    "filename": "document.pdf",
    "pages": 10,
    "summary": "Summary text..."
  }
  ```

#### Get PDF Details
- **GET** `/api/pdf/:pdfId`
- **Response**: PDF metadata and summary

#### Get All PDFs
- **GET** `/api/pdf?limit=10&skip=0`
- **Response**: List of all uploaded PDFs with pagination

#### Search PDFs
- **GET** `/api/pdf/search/:query`
- **Response**: PDFs matching the search query

#### Delete PDF
- **DELETE** `/api/pdf/:pdfId`
- **Response**: Confirmation of deletion

### Chat & Q&A

#### Ask a Question
- **POST** `/api/chat/ask`
- **Body**:
  ```json
  {
    "pdfId": "60d5ec49c1234567890abc12",
    "sessionId": "user-session-123",
    "question": "What is the main topic?"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "question": "What is the main topic?",
      "answer": "The document discusses...",
      "pdfId": "60d5ec49c1234567890abc12",
      "sessionId": "user-session-123"
    }
  }
  ```

#### Get Chat History
- **GET** `/api/chat/history/:pdfId/:sessionId`
- **Response**: All messages in a chat session

#### Clear Chat History
- **DELETE** `/api/chat/history/:pdfId/:sessionId`
- **Response**: Confirmation of deletion

#### Get All Sessions
- **GET** `/api/chat/sessions/:pdfId`
- **Response**: List of all sessions for a PDF

### Health Check
- **GET** `/api/health`
- **Response**: Server status

## Project Structure

```
pdf-chatbot/
├── src/
│   ├── server.js                 # Main entry point
│   ├── models/
│   │   ├── Pdf.js               # PDF model
│   │   └── Chat.js              # Chat model
│   ├── services/
│   │   ├── pdfService.js        # PDF operations
│   │   ├── chatService.js       # Chat operations
│   │   └── aiService.js         # AI/LLM operations
│   ├── routes/
│   │   ├── pdfRoutes.js         # PDF endpoints
│   │   └── chatRoutes.js        # Chat endpoints
│   └── middleware/
│       └── uploadMiddleware.js  # File upload handling
├── uploads/                      # Uploaded PDF files
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/pdf-chatbot` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `LLM_MODEL` | LLM model to use | `gpt-3.5-turbo` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |
| `MAX_FILE_SIZE` | Max file size in bytes | `52428800` (50MB) |

## Usage Example

### 1. Upload a PDF
```bash
curl -X POST http://localhost:5000/api/pdf/upload \
  -F "pdf=@document.pdf"
```

### 2. Ask a Question
```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "pdfId": "60d5ec49c1234567890abc12",
    "sessionId": "user-123",
    "question": "What is this document about?"
  }'
```

### 3. Get Chat History
```bash
curl http://localhost:5000/api/chat/history/60d5ec49c1234567890abc12/user-123
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

All errors include a message:
```json
{
  "error": "Error description"
}
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB username/password if using auth

### OpenAI API Errors
- Verify API key is correct
- Check API key has sufficient quota
- Ensure API is not rate limited

### PDF Upload Fails
- Check file is valid PDF
- Verify file size is under limit
- Ensure `/uploads` directory is writable

### Large PDFs
- For large PDFs, increase `MAX_FILE_SIZE` in `.env`
- May need to adjust timeout values

## Performance Optimization

1. **Add indexes** - MongoDB queries are already indexed
2. **Pagination** - Use limit and skip for large datasets
3. **Caching** - Consider caching AI responses for common questions
4. **Async Processing** - Use background jobs for large PDF processing

## Security Considerations

1. **API Keys** - Keep OpenAI API key secure in `.env`
2. **File Validation** - Only PDF files allowed
3. **File Size Limits** - Prevent DoS attacks
4. **Input Validation** - All inputs validated with express-validator
5. **CORS** - Configured to specific origin
6. **Database** - Use MongoDB authentication in production

## License

MIT

## Support

For issues and questions, please create an issue in the repository.

---

**Happy Chatting! 🤖📄**
