import React, { useState } from 'react';

const Home = () => {
  const [streamerName, setStreamerName] = useState('');
  const [sessionLink, setSessionLink] = useState('');
  const [error, setError] = useState('');

  // Function to handle session creation
  const createSession = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/create-session', {  // <-- Updated URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streamerName }), // Send streamerName in body
      });

      if (response.ok) {
        const data = await response.json();
        setSessionLink(data.link); // Display the session link
      } else {
        setError('Failed to create session. Please try again.');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1>Welcome to the Home Page</h1>
        <p>We'll help you get constructive feedback on your live streams.</p>
        
        {/* New section for session creation */}
        <div className="mt-4">
          <h3>Create a Session</h3>
          <p>Enter your streamer name to generate your unique session link:</p>
          
          <input
            type="text"
            value={streamerName}
            onChange={(e) => setStreamerName(e.target.value)}
            placeholder="Enter your streamer name"
            className="form-control mt-2"
          />

          <button className="btn btn-primary mt-3" onClick={createSession}>
            Create Session
          </button>
        </div>

        {/* Show session link if available */}
        {sessionLink && (
          <div className="mt-3">
            <p>Your session has been created! Here is your dashboard link:</p>
            <a href={sessionLink} target="_blank" rel="noopener noreferrer">
              {sessionLink}
            </a>
          </div>
        )}

        {/* Show error message if session creation fails */}
        {error && <p className="text-danger mt-3">{error}</p>}

        <a href="/chat" className="btn btn-primary mt-3">Go to Chat</a>
        <a href="/feedback" className="btn btn-secondary mt-3 ms-2">View Feedback</a>
      </div>

      <p>What is this and How does it work?</p>
      <p>We built a tool called Evalubot to solicit constructive feedback and synthesize the results into actionable insights for you as a streamer!</p>
    </div>
  );
};

export default Home;
