const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB, getIsConnected } = require('./config/db');
const configureSession = require('./config/session');
const { initFallbackData } = require('./config/store');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Initialize Database & In-Memory Store
connectDB().then(() => {
  initFallbackData();
});

// Middleware Stack
// 1. CORS with credentials for cookie sessions
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Cookie parser
app.use(cookieParser());

// 4. Session management with express-session
app.use(configureSession());

// 5. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    application: 'SpendWise Full-Stack API',
    environment: process.env.NODE_ENV || 'development',
    database: getIsConnected() ? 'Connected (MongoDB)' : 'In-Memory Fallback Active',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// 6. Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);

// 7. Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log('============================================================');
  console.log(`[SpendWise Server] Running on http://localhost:${PORT}`);
  console.log(`[SpendWise Server] Client Origin Allowed: ${CLIENT_URL}`);
  console.log(`[SpendWise Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('============================================================');
});
