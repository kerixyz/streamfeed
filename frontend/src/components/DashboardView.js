import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

const DashboardView = ({ streamer }) => {
  const [activeTab, setActiveTab] = useState('viewer'); // Track active tab
  const [chatMessages, setChatMessages] = useState([]);
  const [topSummaries, setTopSummaries] = useState({
    why_viewers_watch: 'Loading...',  
    how_to_improve: 'Loading...',
  });
  const [categorySummaries, setCategorySummaries] = useState({}); // Store category summaries

  useEffect(() => {
    if (streamer) {
      fetchChatMessages();
      fetchSummaries();
    }
  }, [streamer]);

  const fetchSummaries = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-chat-summaries`, {
        params: { streamerName: streamer },
      });
      setTopSummaries(response.data.topSummaries || {});
      setCategorySummaries(response.data.categorySummaries || {});
    } catch (error) {
      console.error('Error fetching summaries:', error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-chat-messages`, {
        params: { streamerName: streamer },
      });
      const userMessages = response.data.messages.filter(msg => msg.role === 'user');
      setChatMessages(userMessages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50">
      <h2 className="text-3xl font-semibold mb-4 text-center">Streamer Dashboard</h2>

      {/* Tab Navigation */}
      <div className="flex mb-4">
        <button 
          className={`px-4 py-2 ${activeTab === 'viewer' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('viewer')}
        >
          Viewer Feedback
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'external' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('external')}
        >
          External Feedback
        </button>
      </div>

      {/* Viewer Feedback Tab */}
      {activeTab === 'viewer' && (
        <section className="w-full max-w-5xl mb-6">
          {chatMessages.length === 0 ? (
            <div className="p-4 rounded-lg text-center">
              <p>No feedback yet.</p>
              <p>Share this link with your viewers to start gathering feedback:</p>
              <a
                href={`/chat/${streamer}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {`https://www.streamfeed.xyz/chat/${streamer}`}
              </a>
            </div>
          ) : (
            <>
              {/* Top-Level Summaries */}
              <section className="w-full max-w-5xl mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg shadow-md border-l-4" style={{ borderColor: '#56e8ad' }}>
                    <h4 className="text-xl font-semibold mb-1">Why Your Viewers Watch You</h4>
                    <p className="text-base text-gray-700 mb-2">{topSummaries.why_viewers_watch || 'No summary available'}</p>
                  </div>
                  <div className="p-4 rounded-lg shadow-md border-l-4" style={{ borderColor: '#ff8280' }}>
                    <h4 className="text-xl font-semibold mb-1">How You Can Improve</h4>
                    <p className="text-base text-gray-700 mb-2">{topSummaries.how_to_improve || 'No summary available'}</p>
                  </div>
                </div>
              </section>

              {/* Category Summaries */}
              <section className="w-full max-w-5xl mb-6">
                <h3 className="text-2xl font-semibold mb-4 text-center">Feedback Summaries by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(categorySummaries).map(([category, feedbackItems]) => (
                    <div key={category} className="p-4 bg-gray-100 rounded-lg shadow-md">
                      <h4 className="text-lg font-semibold mb-2">{category}</h4>
                      <p className="text-sm font-semibold mb-1">TL;DR: High-level actionable feedback</p>
                      <ul className="list-disc ml-4 text-sm text-gray-700 space-y-1">
                        {feedbackItems.map((feedback, index) => (
                          <li key={index}>{feedback}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </section>
      )}

      {/* External Feedback Tab */}
      {activeTab === 'external' && (
        <section className="w-full max-w-5xl mb-6">
          <h3 className="text-2xl font-semibold mb-4 text-center">External Feedback</h3>
          <p>External feedback content will go here (coming soon).</p>
        </section>
      )}
    </div>
  );
};

export default DashboardView;
