const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const chatSocket = require('./sockets/chatSocket'); // Optional if you're organizing separately

dotenv.config();

const app = express();
const server = http.createServer(app);

// Create socket.io server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (safe for testing)
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Setup socket.io events
io.on('connection', (socket) => {
  console.log('🟢 New client connected');

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected');
  });
});

// Endpoint to fetch messages
app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Endpoint to post message
app.post('/messages', async (req, res) => {
  const { sender_id, text, lang } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO messages (sender_id, text, lang) VALUES ($1, $2, $3) RETURNING *',
      [sender_id, text, lang]
    );

    const newMessage = result.rows[0];

    // Emit to all connected clients
    io.emit('newMessage', newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
