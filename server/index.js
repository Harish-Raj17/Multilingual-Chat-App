const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// Socket.io setup
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// after creating io
const chatSocket = require('./sockets/chatSocket');
chatSocket(io);


// Test route
app.get('/', (req, res) => {
  res.send('🌍 Server is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
