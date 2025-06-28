import React, { useState, useEffect } from "react";
import socket from "../socket";

const ChatBox = ({ user }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const receiver_id = 2; // For demo, hardcoded receiver

  const sendMessage = () => {
    socket.emit("sendMessage", {
      sender_id: user.id,
      receiver_id,
      message,
      preferred_language: user.preferred_language
    });
    setMessage("");
  };

  useEffect(() => {
    socket.on(`message:${user.id}`, (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off(`message:${user.id}`);
    };
  }, [user.id]);

  return (
    <div>
      <h3>Welcome, {user.name}</h3>
      <div style={{ border: "1px solid black", height: 200, overflowY: "scroll", padding: 10 }}>
        {chat.map((msg, i) => (
          <div key={i}>
            <b>From {msg.sender_id}:</b> {msg.original_text} <br />
            <i>({msg.translated_text})</i>
            <hr />
          </div>
        ))}
      </div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;
