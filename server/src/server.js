import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import reviewerRoutes from './routes/reviewerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import statRoutes from './routes/statRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reviews/:id/comments', commentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reviewers', reviewerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Code Review Arena API',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Code Review Arena Server running on http://localhost:${PORT}`);
});
