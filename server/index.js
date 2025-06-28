const { translateText } = require('./translate');


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
const { translateText } = require('./translate'); // add this at top of file

app.post('/messages', async (req, res) => {
  const { sender_id, text, lang } = req.body;

  try {
    // 1. Save message to database
    const result = await pool.query(
      'INSERT INTO messages (sender_id, text, lang) VALUES ($1, $2, $3) RETURNING *',
      [sender_id, text, lang]
    );

    const originalMessage = result.rows[0];

    // 2. Translate message to all supported languages
    const translations = {
      en: await translateText(text, 'en'),
      hi: await translateText(text, 'hi'),
      ta: await translateText(text, 'ta'),
      te: await translateText(text, 'te')
    };

    // 3. Add translations to the message object
    const messageWithTranslations = {
      ...originalMessage,
      translations
    };

    // 4. Emit translated message to all clients
    io.emit('newMessage', messageWithTranslations);

    res.status(201).json(messageWithTranslations);
  } catch (err) {
    console.error('❌ Error saving or translating message:', err);
    res.status(500).json({ error: 'Failed to save or translate message' });
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
