import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';

// Environment toggle (local vs. Heroku)
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

const Chat = () => {
  const { streamer } = useParams();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isStreamer, setIsStreamer] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    // Check if it's a streamer view by presence of token
    if (token) {
      verifyStreamerAccess(token);
    } else {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
        loadChatHistory(storedUserId); // Load chat history for viewers
      }
    }
  }, [streamer, location]);

  // Function to verify streamer's token
  const verifyStreamerAccess = async (token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/verify-dashboard-access?streamerName=${streamer}&token=${token}`
      );
      if (response.data.valid) {
        setIsStreamer(true); // Token is valid, user is a streamer
        await loadChatHistory(); // Load chat history for streamers
      } else {
        setError('Invalid token or unauthorized access');
      }
    } catch (err) {
      console.error('Error verifying token:', err);
      setError('Unable to verify token');
    }
  };

  const loadChatHistory = async (id = null) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/get-chat-messages?${id ? `userId=${id}&` : ''}streamerName=${streamer}`
      );
  
      if (response.data.messages) {
        const filteredMessages = response.data.messages.filter(msg => msg.message && msg.message.trim() !== '');
        const formattedMessages = filteredMessages.map(msg => ({
          role: msg.role,
          content: msg.message,
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  };
  
  // Handle name submission for viewers
  const handleNameSubmit = async () => {
    if (userName.trim() !== '') {
      const generatedUserId = `viewer_${userName}_${Date.now()}`;
      setUserId(generatedUserId);
      localStorage.setItem('userId', generatedUserId);

      // Save the user version and start chat history
      await saveUserVersion(generatedUserId, 'adaptive');
      loadChatHistory(generatedUserId);
    }
  };

  // Save user version to the backend
  const saveUserVersion = async (id, version) => {
    try {
      await axios.post(`${BASE_URL}/save-user-version`, { userId: id, version });
    } catch (err) {
      console.error('Error saving user version:', err);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || !userId) return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);

    try {
      // Save the message to the chat_messages table
      await axios.post(`${BASE_URL}/save-chat-message`, {
        userId,
        streamerName: streamer,
        message: input,
        role: 'user',
      });

      // Get the response from the chatbot API
      const response = await axios.post(`${BASE_URL}/chat`, {
        userId,
        message: input,
      });

      const botMessage = { role: 'bot', content: response.data.reply };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Save the bot's reply to the chat_messages table
      await axios.post(`${BASE_URL}/save-chat-message`, {
        userId,
        streamerName: streamer,
        message: response.data.reply,
        role: 'bot',
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setInput('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lightBlue p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-center text-3xl font-bold text-deepNavy mb-6">
          {isStreamer ? `Welcome to your dashboard, ${streamer}!` : `Chat to give feedback to ${streamer}`}
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {/* Name Input for Viewers */}
        {!isStreamer && !userId && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-deepNavy mb-2">Enter your name to start chatting:</h2>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryYellow"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name..."
            />
            <button
              className="bg-primaryYellow text-deepNavy px-4 py-2 mt-2 rounded-lg hover:bg-yellow-500 transition"
              onClick={handleNameSubmit}
            >
              Start Chatting
            </button>
          </div>
        )}

        {/* Chat Box */}
        {userId && (
          <div className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="chat-box h-96 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
                <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                >
                {msg.content && (
                    <div
                    className={`px-4 py-2 rounded-lg ${
                        msg.role === 'user' ? 'bg-deepNavy text-white' : 'bg-softGray text-deepNavy'
                    } max-w-xs`}
                    >
                    <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
                    </div>
                )}
                </div>
            ))}
            </div>


            <div className="flex items-center border-t border-softGray p-2">
                <input
                    type="text"
                    className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primaryYellow"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                    if (e.key === 'Enter' && input.trim() !== '') {
                        handleSendMessage();
                    }
                    }}
                />
                <button
                    className="bg-primaryYellow text-deepNavy px-4 py-2 rounded-r-lg hover:bg-yellow-500 transition"
                    onClick={handleSendMessage}
                >
                    Send
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
