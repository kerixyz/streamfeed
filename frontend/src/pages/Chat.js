import React, { useState } from 'react';
import axios from 'axios';
// import './Chat.css'; // Keep this for custom styling or remove if using only Bootstrap

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);

    try {
      const response = await axios.post('http://localhost:5001/api/chat', {
        message: input,
      });

      const botMessage = { role: 'bot', content: response.data.reply };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching response from backend:', error);
    }

    setInput('');
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Chat with GPT</h1>
      <div className="chat-box mb-4 p-3 border rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div key={index} className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={`alert ${msg.role === 'user' ? 'alert-primary' : 'alert-secondary'} w-auto`}>
              <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="btn btn-success" onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
