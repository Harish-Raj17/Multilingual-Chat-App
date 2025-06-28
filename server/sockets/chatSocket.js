const pool = require('../db');
const axios = require('axios');

const translateText = async (text, targetLang) => {
  try {
    const response = await axios.post('https://libretranslate.de/translate', {
      q: text,
      source: 'auto',
      target: targetLang,
      format: 'text'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data.translatedText;
  } catch (error) {
    console.error('Translation error:', error.message);
    return text; // fallback to original
  }
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 New socket connected:', socket.id);

    socket.on('sendMessage', async (data) => {
      const { sender_id, receiver_id, message, preferred_language } = data;

      try {
        const translated = await translateText(message, preferred_language);

        // Store in DB
        await pool.query(
          'INSERT INTO messages (sender_id, receiver_id, original_text, translated_text) VALUES ($1, $2, $3, $4)',
          [sender_id, receiver_id, message, translated]
        );

        // Emit message to receiver
        io.emit(`message:${receiver_id}`, {
          sender_id,
          original_text: message,
          translated_text: translated,
        });
      } catch (err) {
        console.error('Error sending message:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 User disconnected:', socket.id);
    });
  });
};
