const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || "*", // Change this in production
  methods: ["GET", "POST"]
};
app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: corsOptions
});

// Serve static files from React frontend
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// API routes (for testing if the backend is running)
app.get('/api', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Catch-all for React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log(`🔗 A user connected: ${socket.id}`);

  socket.on('playPause', (status) => {
    console.log(`📽️ Play/Pause event received: ${status}`);
    socket.broadcast.emit('playPause', status);
  });

  socket.on('syncTime', (time) => {
    console.log(`⏩ Syncing time to: ${time}`);
    socket.broadcast.emit('syncTime', time);
  });

  socket.on('chatMessage', (message) => {
    console.log(`💬 New chat message: ${message}`);
    socket.broadcast.emit('chatMessage', message);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Start server with error handling
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
}).on('error', (err) => {
  console.error(`❌ Server error: ${err.message}`);
});
