import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';

const Chat = () => {
  const { streamer } = useParams();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState(''); // Store user's name here
  const [isStreamer, setIsStreamer] = useState(false);
  const [error, setError] = useState(null);

  // Token verification logic (unchanged)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const verifyToken = async () => {
      if (token) {
        try {
          // Verify the token with the backend
          const response = await axios.get(`http://localhost:5001/api/verify-dashboard-access?streamerName=${streamer}&token=${token}`);
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
        const response = await axios.get(`http://localhost:5001/api/get-chat-messages?streamerName=${streamer}`);
        
        // Log the response to see if we get messages back
        console.log('Chat history response:', response.data.messages);
        
        if (response.data.messages && response.data.messages.length > 0) {
          setMessages(response.data.messages); // Update the messages state with the fetched messages
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
      await axios.post('http://localhost:5001/api/save-chat-message', {
        userId: 'viewer',
        streamerName: streamer,
        message: input,
        role: 'user',
      });
  
      const response = await axios.post('http://localhost:5001/api/chat', {
        message: input,
      });
  
      const botMessage = { role: 'bot', content: response.data.reply };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
  
      // Save the bot message to the database
      await axios.post('http://localhost:5001/api/save-chat-message', {
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
    <div className="container mt-5">
      <h1 className="text-center mb-4">
        {isStreamer ? `Welcome to your dashboard, ${streamer}!` : `Chat with ${streamer}`}
      </h1>
  
      {error && <div className="alert alert-danger">{error}</div>}
  
      {!error && (
        <>
          {isStreamer ? (
            // Streamer Dashboard View
            <div>
              <h2>Your chat statistics and controls</h2>
              {/* Streamer-specific content here */}
            </div>
          ) : (
            // Viewer Chat View
            <div>
              {/* Viewer-specific content here */}
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
                <button className="btn btn-success" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );  
};

export default Chat;
