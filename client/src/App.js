import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const backendURL = "https://multilingual-chat-app-mf7d.onrender.com"; // Use your real backend URL here
const socket = io(backendURL); // Connect to backend WebSocket

function App() {
  const [username, setUsername] = useState('');
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  // Fetch existing messages from backend on load
  useEffect(() => {
    axios.get(`${backendURL}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));
  }, []);

  // Listen for new messages from server in real time
  useEffect(() => {
    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    // Cleanup socket on unmount
    return () => socket.off('newMessage');
  }, []);

  // Send a new message
  const sendMessage = async () => {
    if (!text.trim()) return;

    const message = {
      sender_id: username || 'Anonymous',
      text,
      lang,
    };

    try {
      await axios.post(`${backendURL}/messages`, message);
      setText('');
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🌐 Multilingual Real-Time Chat</h2>

      <input
        placeholder="Enter your name"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />

      <select value={lang} onChange={e => setLang(e.target.value)}>
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="ta">Tamil</option>
        <option value="te">Telugu</option>
      </select>

      <div style={{ border: '1px solid #ccc', margin: '20px 0', padding: '10px', height: '250px', overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
  <p key={idx}>
    <strong>{msg.sender_id}</strong>: {msg.translations?.[lang] || msg.text}
  </p>
))}

      </div>

      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type your message"
        style={{ width: '70%' }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
