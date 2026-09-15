const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://fittribe2-client.vercel.app', // Add your actual Vercel URL
  'https://fittribe2.vercel.app' // Add any other production URLs
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/health', require('./routes/health'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/social', require('./routes/social'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/meal-planning', require('./routes/meal-planning'));

// Health check endpoint
app.get('/api/status', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  
  res.json({ 
    status: dbStatus === 1 ? 'OK' : 'Database Disconnected',
    database: dbStatus === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Workout tracking events
  socket.on('workout-started', (data) => {
    socket.to(`user-${data.userId}`).emit('workout-update', {
      type: 'started',
      workout: data.workout,
      timestamp: new Date()
    });
  });

  socket.on('workout-completed', (data) => {
    socket.to(`user-${data.userId}`).emit('workout-update', {
      type: 'completed',
      workout: data.workout,
      timestamp: new Date()
    });
  });

  // Real-time progress updates
  socket.on('progress-update', (data) => {
    socket.to(`user-${data.userId}`).emit('progress-changed', {
      type: data.type,
      value: data.value,
      timestamp: new Date()
    });
  });

  // Social features
  socket.on('join-social-room', (userId) => {
    socket.join(`social-${userId}`);
  });

  socket.on('friend-request', (data) => {
    socket.to(`user-${data.targetUserId}`).emit('friend-request-received', {
      from: data.fromUser,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🔌 Socket.IO enabled for real-time features`);
});

module.exports = { app, server, io };
