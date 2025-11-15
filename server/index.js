const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const aiRoutes = require('./routes/ai');
const { authenticateSocket } = require('./middleware/auth');
const { rateLimiter } = require('./middleware/rateLimiter');
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// CORS configuration for Socket.IO - supports multiple origins for multi-device access
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ["http://localhost:3000", "http://localhost:5000"];

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware - support multiple origins
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', rateLimiter, authRoutes);
app.use('/api/upload', rateLimiter, uploadRoutes);
app.use('/api/ai', rateLimiter, aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }
}

// Socket.IO connection handling
const connectedUsers = new Map(); // userId -> socketId

io.use(authenticateSocket);

io.on('connection', (socket) => {
  const userId = socket.userId;
  const username = socket.username;
  
  console.log(`User ${username} (${userId}) connected`);
  connectedUsers.set(userId, socket.id);

  // Send all users list to the newly connected user
  const allUsers = User.getAllUsers();
  const usersList = allUsers
    .filter(u => u.id !== userId)
    .map(({ password, ...user }) => ({
      ...user,
      isOnline: connectedUsers.has(user.id)
    }));
  socket.emit('users-list', usersList);

  // Broadcast user online status to all clients
  io.emit('user-online', { userId, username });
  
  // Broadcast updated users list to all other clients (excluding the newly connected user)
  const updatedUsersList = allUsers
    .map(({ password, ...user }) => ({
      ...user,
      isOnline: connectedUsers.has(user.id)
    }))
    .filter(u => u.id !== userId);
  socket.broadcast.emit('users-list-updated', updatedUsersList);

  // Handle joining a room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${username} joined room ${roomId}`);
    
    // Send existing messages for this room
    const roomMessages = Message.getActiveMessagesByRoom(roomId);
    socket.emit('room-messages', { roomId, messages: roomMessages });
  });

  // Handle joining personal chat (DM)
  socket.on('join-dm', (targetUserId) => {
    // Create consistent DM room ID (sorted user IDs)
    const userIds = [userId, targetUserId].sort();
    const dmRoomId = `dm:${userIds[0]}:${userIds[1]}`;
    
    socket.join(dmRoomId);
    console.log(`User ${username} joined DM with ${targetUserId}`);
    
    // Send existing messages for this DM
    const dmMessages = Message.getActiveMessagesByRoom(dmRoomId);
    socket.emit('room-messages', { roomId: dmRoomId, messages: dmMessages });
    
    // Return the DM room ID to the client
    socket.emit('dm-room-created', { roomId: dmRoomId, targetUserId });
  });

  // Handle leaving a room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${username} left room ${roomId}`);
  });

  // Handle sending messages
  socket.on('send-message', (data) => {
    const { roomId, message, type = 'text', fileUrl } = data;
    
    const messageData = {
      id: Date.now().toString(),
      userId,
      username,
      message,
      type, // 'text', 'image', 'voice'
      fileUrl,
      roomId, // Include roomId in message data
      timestamp: new Date().toISOString()
    };

    // Save message to persistent storage
    Message.addMessage(messageData);

    // For personal chats (DM), send to specific users
    if (roomId.startsWith('dm:')) {
      const dmParts = roomId.split(':');
      const targetUserId = dmParts[1] === userId ? dmParts[2] : dmParts[1];
      const targetSocketId = connectedUsers.get(targetUserId);
      
      // Send to sender
      socket.emit('receive-message', messageData);
      // Send to recipient if online
      if (targetSocketId) {
        io.to(targetSocketId).emit('receive-message', messageData);
      }
    } else {
      // Broadcast to room (public rooms)
      io.to(roomId).emit('receive-message', messageData);
    }
  });

  // Handle deleting messages
  socket.on('delete-message', (data) => {
    const { messageId, roomId } = data;
    
    // Delete message (only if user owns it)
    const deletedMessage = Message.deleteMessage(messageId, roomId, userId);
    
    if (deletedMessage) {
      // Broadcast deletion to room
      io.to(roomId).emit('message-deleted', { messageId, roomId });
    } else {
      // Send error if message not found or user doesn't own it
      socket.emit('delete-error', { 
        message: 'Message not found or you do not have permission to delete it' 
      });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', {
      userId,
      username,
      isTyping: data.isTyping
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${username} disconnected`);
    connectedUsers.delete(userId);
    io.emit('user-offline', { userId, username });
    
    // Broadcast updated users list
    const allUsers = User.getAllUsers();
    const usersList = allUsers
      .filter(u => u.id !== userId)
      .map(({ password, ...user }) => ({
        ...user,
        isOnline: connectedUsers.has(user.id)
      }));
    io.emit('users-list-updated', usersList);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

