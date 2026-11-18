const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const jobRoutes = require('./routes/jobRoutes');
const studentRoutes = require('./routes/studentRoutes');
const employerRoutes = require('./routes/employerRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const savedJobRoutes = require('./routes/savedJobRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Ensure uploads/resumes directory exists and is strictly private
const uploadDir = path.join(__dirname, 'uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Global Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'PartTimeConnect API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Start server if not running inside test environment
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[PartTimeConnect Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error(`[Server Start Failed]: Unable to connect to MongoDB at ${process.env.MONGODB_URI}`);
      console.error(err.message);
      process.exit(1);
    });
}

module.exports = app;
