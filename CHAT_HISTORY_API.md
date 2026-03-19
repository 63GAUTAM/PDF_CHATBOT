# Chat History & Conversation API Documentation

## Overview
The enhanced chat history system allows users to view, search, and manage their previous conversations and Q&A interactions with PDFs.

---

## API Endpoints

### 1. Get Detailed Chat History for a Session

**Endpoint:** `GET /api/chat/history/:sessionId`

**Description:** Retrieve complete chat history for a specific session with formatted messages and metadata.

**Parameters:**
- `sessionId` (path param) - The session ID to retrieve history for

**Example Request:**
```bash
curl http://localhost:5000/api/chat/history/session-123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-123",
    "pdfNames": ["document.pdf", "notes.pdf"],
    "messageCount": 5,
    "createdAt": "2024-03-19T10:30:00Z",
    "updatedAt": "2024-03-19T11:45:00Z",
    "messages": [
      {
        "id": "msg-0",
        "question": "What is the main topic of this document?",
        "answer": "The main topic is...",
        "timestamp": "2024-03-19T10:35:00Z",
        "confidence": 0.8
      },
      {
        "id": "msg-1",
        "question": "Can you summarize the key points?",
        "answer": "The key points include...",
        "timestamp": "2024-03-19T10:40:00Z",
        "confidence": 0.9
      }
    ],
    "predictedQuestions": [
      "What are the main concepts?",
      "How does this relate to...",
      "What are the implications?"
    ]
  }
}
```

---

### 2. Get All Conversations with Pagination

**Endpoint:** `GET /api/chat/conversations`

**Description:** Retrieve all conversations with pagination, sorting, and summary information.

**Query Parameters:**
- `limit` (optional, default: 10) - Number of conversations per page
- `skip` (optional, default: 0) - Number of conversations to skip
- `sort` (optional, default: updatedAt) - Sort field: `createdAt`, `updatedAt`

**Example Requests:**
```bash
# Get first 10 conversations
curl http://localhost:5000/api/chat/conversations

# Get next page (skip 10, limit 10)
curl http://localhost:5000/api/chat/conversations?limit=10&skip=10

# Sort by creation date
curl http://localhost:5000/api/chat/conversations?sort=createdAt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "limit": 10,
    "skip": 0,
    "conversations": [
      {
        "sessionId": "session-123",
        "pdfNames": ["document.pdf"],
        "messageCount": 5,
        "lastMessage": {
          "question": "Can you summarize?",
          "answer": "Based on the document...",
          "timestamp": "2024-03-19T11:45:00Z"
        },
        "hasQuestions": true,
        "createdAt": "2024-03-19T10:30:00Z",
        "updatedAt": "2024-03-19T11:45:00Z"
      },
      {
        "sessionId": "session-456",
        "pdfNames": ["notes.pdf", "slides.pdf"],
        "messageCount": 3,
        "lastMessage": {
          "question": "What is this?",
          "answer": "This is about...",
          "timestamp": "2024-03-19T09:20:00Z"
        },
        "hasQuestions": false,
        "createdAt": "2024-03-19T08:15:00Z",
        "updatedAt": "2024-03-19T09:20:00Z"
      }
    ]
  }
}
```

---

### 3. Get Recent Conversations

**Endpoint:** `GET /api/chat/recent`

**Description:** Retrieve the most recent conversations for quick access.

**Query Parameters:**
- `limit` (optional, default: 5) - Number of recent conversations to retrieve

**Example Requests:**
```bash
# Get 5 most recent conversations
curl http://localhost:5000/api/chat/recent

# Get 10 most recent conversations
curl http://localhost:5000/api/chat/recent?limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recentConversations": [
      {
        "sessionId": "session-123",
        "pdfNames": ["document.pdf"],
        "messageCount": 5,
        "lastMessage": {
          "question": "Can you summarize?",
          "preview": "Based on the document, the main points are...",
          "timestamp": "2024-03-19T11:45:00Z"
        },
        "updatedAt": "2024-03-19T11:45:00Z"
      },
      {
        "sessionId": "session-456",
        "pdfNames": ["notes.pdf"],
        "messageCount": 3,
        "lastMessage": {
          "question": "What is this about?",
          "preview": "This document discusses the following...",
          "timestamp": "2024-03-19T09:20:00Z"
        },
        "updatedAt": "2024-03-19T09:20:00Z"
      }
    ]
  }
}
```

---

### 4. Search Chat History

**Endpoint:** `GET /api/chat/search`

**Description:** Search through all conversations by session ID, question, or answer content.

**Query Parameters:**
- `query` (required) - Search term to find in sessions, questions, or answers
- `limit` (optional, default: 10) - Maximum number of results

**Example Requests:**
```bash
# Search for conversations about "machine learning"
curl "http://localhost:5000/api/chat/search?query=machine+learning"

# Search with custom limit
curl "http://localhost:5000/api/chat/search?query=summary&limit=20"

# Search for specific session ID
curl "http://localhost:5000/api/chat/search?query=session-123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "machine learning",
    "resultCount": 3,
    "results": [
      {
        "sessionId": "session-789",
        "pdfNames": ["ML_Guide.pdf"],
        "messageCount": 8,
        "lastMessage": {
          "question": "Explain machine learning algorithms",
          "answer": "Machine learning includes supervised and unsupervised...",
          "timestamp": "2024-03-19T10:15:00Z"
        },
        "createdAt": "2024-03-19T09:00:00Z",
        "updatedAt": "2024-03-19T10:15:00Z"
      }
    ]
  }
}
```

---

### 5. Get All Sessions

**Endpoint:** `GET /api/chat/sessions`

**Description:** Retrieve all sessions with their associated PDFs.

**Example Request:**
```bash
curl http://localhost:5000/api/chat/sessions
```

**Response:**
```json
{
  "sessions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sessionId": "session-123",
      "pdfIds": ["pdf-id-1", "pdf-id-2"],
      "createdAt": "2024-03-19T10:30:00Z",
      "updatedAt": "2024-03-19T11:45:00Z"
    }
  ]
}
```

---

### 6. Clear Chat History

**Endpoint:** `DELETE /api/chat/history/:sessionId`

**Description:** Delete all messages and history for a specific session.

**Parameters:**
- `sessionId` (path param) - The session ID to clear

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/chat/history/session-123
```

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared"
}
```

---

## Frontend Integration Examples

### Display Recent Conversations
```javascript
async function loadRecentChats() {
  const response = await fetch('http://localhost:5000/api/chat/recent?limit=5');
  const data = await response.json();
  
  data.data.recentConversations.forEach(conv => {
    console.log(`Session: ${conv.sessionId}`);
    console.log(`PDFs: ${conv.pdfNames.join(', ')}`);
    console.log(`Messages: ${conv.messageCount}`);
  });
}
```

### Search for Specific Topic
```javascript
async function searchChats(searchTerm) {
  const response = await fetch(`http://localhost:5000/api/chat/search?query=${encodeURIComponent(searchTerm)}`);
  const data = await response.json();
  
  console.log(`Found ${data.data.resultCount} conversations with "${searchTerm}"`);
  return data.data.results;
}
```

### Load Full Conversation
```javascript
async function loadConversation(sessionId) {
  const response = await fetch(`http://localhost:5000/api/chat/history/${sessionId}`);
  const data = await response.json();
  
  const chat = data.data;
  console.log(`Conversation from ${chat.createdAt}`);
  console.log(`PDFs: ${chat.pdfNames.join(', ')}`);
  
  chat.messages.forEach(msg => {
    console.log(`Q: ${msg.question}`);
    console.log(`A: ${msg.answer}\n`);
  });
  
  if (chat.predictedQuestions.length > 0) {
    console.log('Predicted Questions:');
    chat.predictedQuestions.forEach(q => console.log(`- ${q}`));
  }
}
```

### Paginated Conversation List
```javascript
async function loadAllConversations() {
  let skip = 0;
  const limit = 10;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`http://localhost:5000/api/chat/conversations?limit=${limit}&skip=${skip}`);
    const data = await response.json();
    
    // Process conversations...
    data.data.conversations.forEach(conv => {
      console.log(conv);
    });
    
    skip += limit;
    hasMore = skip < data.data.total;
  }
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request (missing parameters, invalid input) |
| 500 | Server error |

**Error Response Format:**
```json
{
  "error": "Detailed error message"
}
```

---

## Use Cases

### Display Chat Sidebar
Use `/api/chat/recent` to show the 5 most recent conversations in a sidebar.

### Show Conversation History
Use `/api/chat/history/:sessionId` to display full conversation when user clicks a session.

### Search Functionality
Use `/api/chat/search?query=...` to implement a search feature for finding previous questions/answers.

### Pagination
Use `/api/chat/conversations?limit=10&skip=0` to paginate through all conversations.

### Statistics Dashboard
Combine endpoints to show:
- Total conversations
- Most active sessions
- Frequently asked topics (via search)
- Message count per session

---

## Best Practices

1. **Caching:** Cache recent conversations in the frontend to reduce API calls
2. **Pagination:** Always use pagination for listing all conversations (don't fetch everything at once)
3. **Search:** Implement search with debouncing to avoid too many API requests
4. **Sorting:** Allow users to sort by date created or date updated
5. **Filtering:** Consider adding filters by PDF name or message count

---

## Performance Tips

- Use pagination with reasonable limits (10-20 per page)
- Cache the `/recent` endpoint response (updates less frequently)
- Implement infinite scroll with `/conversations?skip=X` for better UX
- Debounce search requests (wait 300ms after typing stops)
