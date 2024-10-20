import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';

// Environment toggle (local vs. Heroku)
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

const Chat = () => {
  const { streamer } = useParams();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreamer, setIsStreamer] = useState(false);
  const [error, setError] = useState(null);

  // Token verification logic
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const verifyToken = async () => {
      if (token) {
        try {
          // Verify the token with the backend
          const response = await axios.get(`${BASE_URL}/verify-dashboard-access?streamerName=${streamer}&token=${token}`);
          if (response.data.valid) {
            console.log('Token is valid, setting streamer mode');
            setIsStreamer(true); // Token is valid, user is a streamer
            await loadChatHistory(); // Load chat history after verification
          } else {
            setError('Invalid token or unauthorized access');
            console.log('Invalid token');
          }
        } catch (err) {
          console.error('Error verifying token:', err);
          setError('Unable to verify token');
        }
      } else {
        // If no token is provided, handle as viewer access (no streamer privileges)
        console.log('No token provided, viewer mode');
        setIsStreamer(false);  // Explicitly set to viewer mode
        await loadChatHistory(); // Load chat history for viewers as well
      }
    };

    const loadChatHistory = async () => {
      try {
        console.log('Loading chat history for streamer:', streamer); // Log the streamer for debugging
        const response = await axios.get(`${BASE_URL}/get-chat-messages?streamerName=${streamer}`);
        
        console.log('Chat history response:', response.data.messages); // Log the response
        
        if (response.data.messages && response.data.messages.length > 0) {
          setMessages(response.data.messages); // Update messages state
          console.log('Messages loaded into state:', response.data.messages);
        } else {
          console.log('No messages found for this streamer');
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
      }
    };

    verifyToken();
  }, [streamer, location]);

  const handleSendMessage = async () => {
    console.log('Input value:', input); // Log the input to verify it
    if (input.trim() === '') return; // If input is empty, do nothing

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);

    try {
      // Save the user message to the database
      await axios.post(`${BASE_URL}/save-chat-message`, {
        userId: 'viewer',
        streamerName: streamer,
        message: input,
        role: 'user',
      });

      const response = await axios.post(`${BASE_URL}/chat`, {
        message: input,
      });

      const botMessage = { role: 'bot', content: response.data.reply };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Save the bot message to the database
      await axios.post(`${BASE_URL}/save-chat-message`, {
        userId: 'bot',
        streamerName: streamer,
        message: response.data.reply,
        role: 'bot',
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setInput(''); // Clear the input after sending
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lightBlue p-4">
      <div className="w-full max-w-2xl">
        {/* Page Title */}
        <h1 className="text-center text-3xl font-bold text-deepNavy mb-6">
          {isStreamer ? `Welcome to your dashboard, ${streamer}!` : `Chat with ${streamer}`}
        </h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}
        {/* Streamer Dashboard View */}
        {!error && isStreamer && (
          <div className="flex flex-col bg-white shadow-lg rounded-lg p-6 space-y-6">
            {/* Placeholder Header */}
            <h2 className="text-2xl font-semibold text-deepNavy mb-4">
              Your Chat Statistics and Controls
            </h2>

            {/* Chat Statistics Section */}
            <div className="bg-softGray p-4 rounded-lg">
              <h3 className="text-xl font-bold text-deepNavy mb-2">Chat Statistics</h3>
              <ul className="list-disc ml-5 text-deepNavy space-y-1">
                <li>Total messages: <span className="font-semibold">150</span></li>
                <li>Average response time: <span className="font-semibold">5.2 seconds</span></li>
                <li>Top keywords: <span className="font-semibold">"feedback", "stream", "viewers"</span></li>
              </ul>
            </div>

            {/* Streamer Controls Section */}
            <div className="bg-softGray p-4 rounded-lg">
              <h3 className="text-xl font-bold text-deepNavy mb-2">Controls</h3>
              <div className="flex flex-col space-y-3">
                <button className="bg-deepNavy text-white py-2 rounded-lg hover:bg-primaryYellow transition">
                  End Current Session
                </button>
                <button className="bg-deepNavy text-white py-2 rounded-lg hover:bg-primaryYellow transition">
                  View Chat History
                </button>
                <button className="bg-deepNavy text-white py-2 rounded-lg hover:bg-primaryYellow transition">
                  Export Chat Data
                </button>
              </div>
            </div>

            {/* Placeholder for Future Dashboard Components */}
            <div className="bg-softGray p-4 rounded-lg">
              <h3 className="text-xl font-bold text-deepNavy mb-2">Coming Soon</h3>
              <p className="text-deepNavy">
                More analytics, engagement metrics, and chat moderation tools are on the way!
              </p>
            </div>
          </div>
        )}

        {/* Viewer Chat View */}
        {!error && !isStreamer && (
          <div className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Chat Box with Fixed Height */}
            <div className="chat-box h-96 p-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      msg.role === 'user' ? 'bg-deepNavy text-white' : 'bg-softGray text-deepNavy'
                    } max-w-xs`}
                  >
                    <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex items-center border-t border-softGray p-2">
              <input
                type="text"
                className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primaryYellow"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
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
