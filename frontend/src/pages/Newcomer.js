import React, { useState } from 'react';
import axios from 'axios';

// Environment toggle (local vs. Heroku)
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

const Newcomer = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const [streamerName, setStreamerName] = useState('');
  const [userId, setUserId] = useState('');

  // Handle form submission
  const handleSubmit = async () => {
    if (userName.trim() === '' || streamerName.trim() === '') return;

    // Generate a unique userId for this user
    const generatedUserId = `newcomer_${userName}_${Date.now()}`;
    setUserId(generatedUserId);

    // Optionally, you can initialize chat history here
    try {
      await axios.post(`${BASE_URL}/initialize-chat`, {
        userId: generatedUserId,
        streamerName,
      });
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || !userId) return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);

    try {
      // Save the message to the database
      await axios.post(`${BASE_URL}/save-newcomer-message`, {
        userId,
        streamerName,
        message: input,
        role: 'user',
    });    

      // Get the chatbot's response
      const response = await axios.post(`${BASE_URL}/chat`, {
        userId,
        message: input,
      });

      if (response.data && response.data.reply) {
        const botMessage = { role: 'bot', content: response.data.reply };
        setMessages((prevMessages) => [...prevMessages, botMessage]);

        // Save the bot's reply to the database
        await axios.post(`${BASE_URL}/save-newcomer-message`, {
            userId,
            streamerName,
            message: response.data.reply,
            role: 'bot',
        });
        
      }
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
    }

    setInput('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 md:px-6 bg-white">
      {/* Input Fields for Username and Streamer Name */}
      {!userId && (
        <div className="w-full max-w-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Enter your details to start chatting:</h2>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <input
            type="text"
            value={streamerName}
            onChange={(e) => setStreamerName(e.target.value)}
            placeholder="Streamer name..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 mt-2 rounded-lg hover:bg-blue-500 transition"
          >
            Start Chatting
          </button>
        </div>
      )}

      {/* Chat Box */}
      {userId && (
        <>
          <p>Thanks for giving feedback to {streamerName}. Your thoughts are valuable and will help improve their content. To get started, simply say <strong>`hello`</strong> and start sharing your feedback!</p>
          <div className="flex flex-col w-full max-w-4xl md:max-w-2xl lg:max-w-lg bg-gray-100 rounded-lg shadow-md overflow-hidden">
            {/* Messages Container */}
            <div className="flex-grow h-96 md:h-80 overflow-auto p-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-900'} max-w-xs md:max-w-md lg:max-w-lg`}>
                    <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Container */}
            <div className="flex items-center border-t p-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && input.trim() !== '') {
                    handleSendMessage();
                  }
                }}
                className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-500 transition"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Newcomer;
