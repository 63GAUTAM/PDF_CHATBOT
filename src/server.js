const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Suppress pdf-parse warnings
process.on('warning', (warning) => {
  if (warning.message && warning.message.includes('TT: undefined function')) {
    return; // Suppress this specific warning
  }
  console.warn(warning);
});

// Override console methods to filter warnings
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('TT: undefined function')) {
    return; // Suppress this specific warning
  }
  originalConsoleWarn.apply(console, args);
};

// Load environment variables
dotenv.config();

// Import routes
const pdfRoutes = require('./routes/pdfRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const shareRoutes = require('./routes/shareRoutes');
const exportRoutes = require('./routes/exportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Import middleware
const authMiddleware = require('./middleware/authMiddleware');
const { apiLimiter, chatLimiter, publicLimiter } = require('./middleware/rateLimitMiddleware');
const loggerMiddleware = require('./middleware/loggerMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow file:// protocol and localhost
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply logger middleware
app.use(loggerMiddleware);

// Apply rate limiting
app.use('/api/', apiLimiter);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!require('fs').existsSync(uploadDir)) {
  require('fs').mkdirSync(uploadDir, { recursive: true });
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pdf-chatbot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/share', shareRoutes);

// PDF routes (with chat limiter)
app.use('/api/pdf', chatLimiter, pdfRoutes);

// Chat routes (with chat limiter)
app.use('/api/chat', chatLimiter, chatRoutes);

// Protected routes (require authentication)
app.use('/api/feedback', feedbackRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(5000, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
