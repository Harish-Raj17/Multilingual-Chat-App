require('./initDB');





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

app.use(express.json()); // Allows backend to read JSON from request

app.post('/messages', async (req, res) => {
  const { sender_id, text, lang } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO messages (sender_id, text, lang) VALUES ($1, $2, $3) RETURNING *',
      [sender_id, text, lang]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error saving message:", err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY timestamp ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
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
const pool = require('./db');
