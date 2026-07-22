// Server startup entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

// Database connection
const connectDB = require('./config/db');
connectDB();

const app = express();

// ========== SECURITY MIDDLEWARES ==========

// Helmet for security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
}));

// Morgan for logging
app.use(morgan('dev'));

// CORS configuration
app.use(cors({
    origin: '*',  // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - 500 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// ========== ROUTES ==========

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'ServiceHub API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// API Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/bookings', require('./routes/bookingRoutes'));
app.use('/api/v1/services', require('./routes/serviceRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/payments', require('./routes/paymentRoutes'));
app.use('/api/v1/upload', require('./src/routes/uploadRoutes'));
app.use('/api/v1/reviews', require('./routes/reviewRoutes'));

// ========== ERROR HANDLING ==========

// 404 Not Found handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: messages,
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
        });
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
    ┌─────────────────────────────────────────┐
    │   🚀 ServiceHub Backend Server         │
    ├─────────────────────────────────────────┤
    │   📡 Port: ${PORT}                         │
    │   🌐 Environment: ${process.env.NODE_ENV || 'development'}    │
    │   🔗 API URL: http://localhost:${PORT}/api/v1  │
    └─────────────────────────────────────────┘
    `);
});

// ========== SOCKET.IO SETUP ==========
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    }
});

// Map of userId -> socketId
const userSocketMap = new Map();

io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Register user connection
    socket.on('register_user', (userId) => {
        userSocketMap.set(userId, socket.id);
        console.log(`👤 User registered: ${userId} -> Socket: ${socket.id}`);
    });

    // Join chat room for a booking
    socket.on('join_booking', (bookingId) => {
        socket.join(`booking_${bookingId}`);
        console.log(`🚪 Socket ${socket.id} joined room: booking_${bookingId}`);
    });

    // Handle incoming chat message (Text or Voice Note)
    socket.on('send_message', async (data) => {
        const { bookingId, senderId, text, audioUrl, isVoiceNote, duration } = data;
        try {
            const Message = require('./models/Message');
            const messageData = {
                bookingId,
                senderId,
                text: text || (isVoiceNote ? '🎤 Voice Note' : ''),
                audioUrl: audioUrl || '',
                isVoiceNote: !!isVoiceNote,
                duration: duration || '0:05'
            };
            const newMessage = await Message.create(messageData);
            // Broadcast message to room
            io.to(`booking_${bookingId}`).emit('new_message', newMessage);
        } catch (error) {
            console.error('Error saving message:', error);
            // Fallback broadcast in case DB creation fails
            io.to(`booking_${bookingId}`).emit('new_message', {
                _id: Date.now().toString(),
                bookingId,
                senderId,
                text: text || '🎤 Voice Note',
                audioUrl: audioUrl || '',
                isVoiceNote: !!isVoiceNote,
                duration: duration || '0:05',
                createdAt: new Date().toISOString()
            });
        }
    });

    // Handle provider live location update
    socket.on('update_provider_location', (data) => {
        const { bookingId, latitude, longitude, eta, distance, speed } = data || {};
        if (bookingId) {
            console.log(`📍 Provider location update for booking ${bookingId}: ETA ${eta}, Dist ${distance}`);
            io.to(`booking_${bookingId}`).emit('provider_location_updated', {
                latitude,
                longitude,
                eta: eta || '5 Mins',
                distance: distance || '0.8 km',
                speed: speed || '25 km/h',
                updatedAt: new Date().toISOString()
            });
        }
    });

    socket.on('disconnect', () => {
        // Find and remove from map
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                console.log(`👤 User unregistered: ${userId}`);
                break;
            }
        }
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// Set global io for controller access
global.io = io;
global.userSocketMap = userSocketMap;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('❌ Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('💥 Process terminated!');
        process.exit(0);
    });
});