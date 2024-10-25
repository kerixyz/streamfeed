import React, { useState } from 'react';

// Environment toggle (local vs. Heroku)
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';


const Home = () => {
  const [streamerName, setStreamerName] = useState('');
  const [sessionLink, setSessionLink] = useState('');
  const [error, setError] = useState('');

  console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);

  // Function to handle session creation
  const createSession = async () => {
    try {
      const response = await fetch(`${BASE_URL}/create-session`, { // <-- Updated URL with toggle
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
    <div className="min-h-screen flex flex-col">
      
      {/* First Section */}
      <section className="flex flex-col md:flex-row items-center justify-between py-10 px-6 bg-gray-100">
        {/* Left Side */}
        <div className="md:w-1/2 mb-6 md:mb-0 md:pl-8 max-w-lg">
          <h1 className="text-4xl font-bold mb-4">StreamFeed</h1>
          <p className="text-lg">
            StreamFeed helps you get detailed feedback on your streams. See through your viewers' eyes and make improvements in real-time.
          </p>
        </div>

        {/* Right Side: Placeholder for sample report */}
        <div className="md:w-1/2 flex justify-center">
          <div className="w-80 h-60 bg-gray-200 flex items-center justify-center rounded-md">
            <span className="text-gray-500">[Sample Report Placeholder]</span>
          </div>
        </div>
      </section>
      
      {/* Second Section */}
      <section className="flex flex-col items-center py-10 px-6 bg-white">
        <h2 className="text-3xl font-semibold mb-4">Get Started with Getting Feedback</h2>
        <input
          type="text"
          value={streamerName}
          onChange={(e) => setStreamerName(e.target.value)}
          placeholder="Enter your streamer name here"
          className="mb-6 p-3 w-full max-w-md border rounded-md shadow-sm focus:outline-none"
        />

        <div className="flex flex-col md:flex-row w-full max-w-4xl">
          {/* Left Side: Feedback with Viewers */}
          <div className="flex-1 p-4 border rounded-lg m-2 bg-gray-50 md:pl-8">
            <h3 className="text-xl font-semibold mb-2">Feedback with Your Viewers</h3>
            <p className="mb-4">Generate a session to start collecting feedback directly from your viewers.</p>
            <button
            onClick={() => {
              if (!streamerName.trim()) {
                alert('Please enter your streamer name.');
                return;
              }
              createSession();
            }}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500 transition"
          >
              Generate Session
            </button>
            {sessionLink && (
              <div className="mt-3 text-blue-600">
                <p>Your session has been created:</p>
                <a href={sessionLink} target="_blank" rel="noopener noreferrer" className="underline">
                  {sessionLink}
                </a>
              </div>
            )}
            {error && <p className="text-red-500 mt-3">{error}</p>}
          </div>

          {/* Right Side: Feedback with Agents */}
          <div className="flex-1 p-4 border rounded-lg m-2 bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">Feedback with Agents</h3>
            <p className="mb-4">Use AI agents to automatically gather insights about your stream.</p>
            
            <p className="mb-4 text-center">Coming Soon!</p>
            {/* <button
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-500 transition"
              onClick={() => alert('Coming Soon!')}
            >
              Get Started
            </button>*/}
          </div> 
        </div>
      </section>
      {/* How Feedback with Viewers Works */}
      <section className="py-10 px-6 bg-gray-100">
        <h2 className="text-3xl font-semibold mb-6 text-center">How Feedback with Viewers Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-full mb-4">
              <span className="text-gray-500">[Photo 1]</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Step 1: Start a Session</h3>
            <p className="text-center text-gray-700">
              Enter your streamer name and generate a feedback session to share with your viewers.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-full mb-4">
              <span className="text-gray-500">[Photo 2]</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Step 2: Collect Feedback</h3>
            <p className="text-center text-gray-700">
              Viewers join the chat and provide feedback directly through the session.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-full mb-4">
              <span className="text-gray-500">[Photo 3]</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Step 3: Analyze Results</h3>
            <p className="text-center text-gray-700">
              See detailed feedback from viewers and use it to improve your stream content.
            </p>
          </div>
        </div>
      </section>

      {/* How Feedback with Agents Works */}
      <section className="py-10 px-6 bg-white">
        <h2 className="text-3xl font-semibold mb-6 text-center">How Feedback with Agents Works</h2>
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-md">
          <p className="text-gray-700 mb-2">
            We're building a new feature that uses AI agents to help you understand feedback better.
          </p>
          <div className="w-80 h-60 bg-gray-200 flex items-center justify-center rounded-md">
            <span className="text-gray-500">[Placeholder for Agent Feature]</span>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-6 px-6 bg-gray-100 text-center text-gray-600">
        <p>This is an ongoing research project at the University of Washington. By clicking any of the links above, you acknowledge that your feedback may be used for ongoing research to improve the StreamFeed platform. We collect and analyze feedback to better understand how streamers engage with their audiences. Your participation is voluntary, and all data will be anonymized to ensure your privacy.</p>
        <p>For questions, comments, or feedback, please contact: kmallari[at]uw[dot]edu</p>
      </footer>
    </div>
  );
};

export default Home;