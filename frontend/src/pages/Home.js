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
    <div className="min-h-screen bg-lightBlue flex flex-col items-center py-10 px-4">
      {/* Header Section */}
      <header className="w-full max-w-4xl mb-8">
        <h1 className="text-center text-4xl font-bold text-deepNavy py-4 border-b-2 border-softGray">
          StreamFeed
        </h1>
      </header>
      
      {/* Main Section */}
      <section className="w-full max-w-4xl bg-softGray rounded-lg p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
          <h2 className="text-2xl font-bold text-deepNavy mb-4">
            Are You a Live Streamer Looking for Real Feedback?
          </h2>
          <p className="text-deepNavy mb-4">
            Struggling to get meaningful insights about your streams? Unsure about the right questions to ask your audience? Tired of the same old vague comments like "Great stream!"? 
          </p>
          <p className="text-deepNavy mb-4 font-semibold">
            What if you could see your content through a third person's eyes?
          </p>
          <p className="text-deepNavy">
            Discover better ways to gather constructive feedback, ask the right questions, and gain a fresh perspective on your streams. Don’t just stream—grow, improve, and thrive!
          </p>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-deepNavy mb-4">
              Are you a streamer?
            </h2>
            <p className="text-deepNavy mb-2">
              Generate your session link here
            </p>
            <input
              type="text"
              value={streamerName}
              onChange={(e) => setStreamerName(e.target.value)}
              placeholder="Enter your streamer name"
              className="mb-4 p-2 border border-deepNavy rounded"
            />
            <button 
              className="bg-deepNavy text-white py-2 rounded hover:bg-primaryYellow transition mb-4"
              onClick={createSession}
            >
              Create Session
            </button>

            {sessionLink && (
              <div className="mt-3">
                <p className="text-deepNavy">
                  Your session has been created! Here is your dashboard link:
                </p>
                <a 
                  href={sessionLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primaryYellow underline"
                >
                  {sessionLink}
                </a>
              </div>
            )}
            {error && <p className="text-red-500 mt-3">{error}</p>}

            <h2 className="text-2xl font-bold text-deepNavy mb-4">
              Are you a viewer trying to access your streamer's link?
            </h2>
            <p className="text-deepNavy mb-2">
              Try visiting streamfeed.com/chat/[streamername]
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Projects Section */}
      <section className="w-full max-w-4xl bg-softGray rounded-lg p-8 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-deepNavy">
          Upcoming Projects
        </h2>
        <p>Learn more about our other upcoming projects</p>
        {/* <ul className="list-disc ml-5 text-deepNavy mb-4">
          <li>Learn more about other ongoing projects</li>
        </ul> */}
        <p className="text-deepNavy mb-2">
          Join our mailing list to stay updated:
        
        <input
          type="text"
          placeholder="Enter your email"
          className="mb-4 p-2 border border-deepNavy rounded"
        />
        </p>

        {/* Related Work Section */}
        <h2 className="text-xl font-semibold mb-4 text-deepNavy">
          Related Work
        </h2>
        <p><a href="https://dl.acm.org/doi/abs/10.1145/3411764.3445320">Understanding Analytics Needs of Live Streamers</a></p>

        {/* About Section */}
        <h2 className="text-xl font-semibold mb-4 text-deepNavy">Who are we?</h2>
        <p>This is an ongoing research project at the University of Washington. By clicking create session, you consent to ....</p>
        <p>For any questions, comments, or feedback, please direct them to kmallari[at]uw[dot]edu</p>
        {/* <ul className="list-disc ml-5 text-deepNavy">
          <li>PhD student at UW</li>
        </ul> */}
      </section>

      {/* <section className="w-full max-w-4xl bg-softGray rounded-lg p-8 mb-8"> */}        
      {/* </section> */}

      {/* <section className="w-full max-w-4xl bg-softGray rounded-lg p-8"> */}
      {/* </section> */}

    </div>
  );
};

export default Home;
