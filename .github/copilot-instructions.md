# PDF Chatbot Backend - Development Instructions

## Project Overview
This is a Node.js backend for a PDF chatbot application with MongoDB. The chatbot can process PDFs, generate summaries, and answer questions about the document content using OpenAI's API.

## Key Features
- PDF upload and text extraction
- Automatic PDF summarization
- Q&A system with chat history
- MongoDB database integration
- Multi-session support
- RESTful API endpoints

## Development Guidelines

### Code Style
- Use ES6+ JavaScript syntax
- Follow Express.js conventions
- Use async/await for asynchronous operations
- Keep functions single-responsibility

### Database Schema
- Pdf Model: Stores uploaded PDFs with content and summaries
- Chat Model: Stores conversation history per session

### API Design
- RESTful endpoints following standard conventions
- Proper HTTP status codes
- Consistent JSON response format
- Input validation for all endpoints

### Error Handling
- All async operations wrapped in try-catch
- Descriptive error messages
- Appropriate HTTP status codes returned
- Error logging to console

## Before Running
1. Install dependencies: `npm install`
2. Configure `.env` file with:
   - MongoDB connection string
   - OpenAI API key
   - Server port
3. Ensure MongoDB is running
4. Start with: `npm run dev` (development) or `npm start` (production)

## Testing the API
Use curl or Postman to test endpoints:
- POST /api/pdf/upload - Upload PDF
- POST /api/chat/ask - Ask questions
- GET /api/pdf - List PDFs
- GET /api/chat/history/:pdfId/:sessionId - Get chat history

## Common Development Tasks

### Adding New Routes
Create a new file in `src/routes/` and import in `src/server.js`

### Adding Database Models
Create a new schema in `src/models/` and use with Mongoose

### Working with PDFs
Use `PdfService` for all PDF operations (extraction, saving, retrieval)

### AI Operations
Use `aiService` for all AI/LLM operations (summarization, Q&A)

## Deployment Notes
- Keep `.env` secure and never commit it
- MongoDB should be production-grade (Atlas or managed service)
- Consider caching for frequently asked questions
- Monitor API usage for OpenAI costs
- Enable proper error logging in production
