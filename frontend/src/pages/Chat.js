import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom'; // For accessing URL params

const Chat = () => {
  const { streamer } = useParams(); // Access the streamer name from the URL
  const location = useLocation(); // To access the query parameters (like token)
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreamer, setIsStreamer] = useState(false); // State to track if the user is a streamer
  const [error, setError] = useState(null); // State to track any errors

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token'); // Extract the token from the URL

    // Verify if the token is valid for accessing the streamer's dashboard
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get(`/api/verify-dashboard-access?streamerName=${streamer}&token=${token}`);
          if (response.data.valid) {
            setIsStreamer(true); // If token is valid, set user as streamer
          } else {
            setError('Invalid token or unauthorized access');
          }
        } catch (err) {
          console.error('Error verifying token:', err);
          setError('Unable to verify token');
        }
      }
    };

    verifyToken();
  }, [streamer, location]);

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
      <h1 className="text-center mb-4">
        {isStreamer ? `Welcome to your dashboard, ${streamer}!` : `Chat with ${streamer}`}
      </h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {!error && (
        <>
          {isStreamer ? (
            // Streamer Dashboard View (You can customize this section further for the streamer)
            <div>
              <h2>Your chat statistics and controls</h2>
              {/* Add streamer-specific content here */}
            </div>
          ) : (
            // Viewer Chat View
            <div>
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
          )}
        </>
      )}
    </div>
  );
};

export default Chat;
