const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Determine CORS origins
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    const origins = [];
    
    // Add primary frontend URL
    if (process.env.FRONTEND_URL) {
      origins.push(process.env.FRONTEND_URL);
    }
    
    // Add Vercel preview URLs pattern (all preview deployments)
    origins.push(/\.vercel\.app$/);
    
    return origins.length > 0 ? origins : 'https://role-based-access-control-fawn-iota.vercel.app';
  }
  
  return ['http://localhost:3000', 'http://localhost:5173'];
};

// CORS Configuration - Critical for Vercel deployment
app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'MERN RBAC API is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log errors in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  }
  
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5001;
const HOST = '0.0.0.0'; // Critical for Render deployment

const server = app.listen(PORT, HOST, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
