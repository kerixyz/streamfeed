import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

const DashboardView = ({ streamer }) => {
  const [activeTab, setActiveTab] = useState('viewer'); // Track active tab
  const [summaries, setSummaries] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [topSummaries, setTopSummaries] = useState({
    why_viewers_watch: 'Loading...',  // Placeholder - to be updated from the database
    how_to_improve: 'Loading...',     // Placeholder - to be updated from the database
  });

  useEffect(() => {
    if (streamer) {
      fetchSummaries();
      fetchChatMessages();
    }
  }, [streamer]);

  const fetchSummaries = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-chat-summaries`, {
        params: { streamerName: streamer },
      });
      setSummaries(response.data);
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
      await generateTopSummaries(userMessages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const generateTopSummaries = async (userMessages) => {
    try {
      console.log('Messages to summarize:', userMessages);
      const response = await axios.post(`${BASE_URL}/generate-summaries`, { messages: userMessages });
      console.log('Summaries response:', response.data);
      setTopSummaries(response.data);
    } catch (error) {
      console.error('Error generating top summaries:', error);
      setTopSummaries({
        why_viewers_watch: 'Error generating summary',
        how_to_improve: 'Error generating summary',
      });
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
          <h3 className="text-2xl font-semibold mb-4 text-center">Viewer Feedback</h3>
          {chatMessages.length === 0 ? (
            <div className="p-4 bg-yellow-100 rounded-lg shadow-md text-center">
              <p>No feedback yet.</p>
              <p>Share this link with your viewers to start gathering feedback:</p>
              <a
                href={`/chat/${streamer}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {`/chat/${streamer}`}
              </a>

              <p>Once youre messages arrive, your dashboard could look like this </p>

              {/* Top-Level Summaries */}
                <section className="w-full max-w-5xl mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Why Viewers Watch */}
                    <div className="p-4 rounded-lg shadow-md border-l-4" style={{ borderColor: '#56e8ad' }}>
                        <h4 className="text-xl font-semibold mb-1">Why Your Viewers Watch You</h4>
                        <p className="text-base text-gray-700 mb-2">
                        {topSummaries.why_viewers_watch}
                        </p>
                        <p className="text-sm italic text-gray-500"> Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>

                    {/* How You Can Improve */}
                    <div className="p-4 rounded-lg shadow-md border-l-4" style={{ borderColor: '#ff8280' }}>
                        <h4 className="text-xl font-semibold mb-1">How You Can Improve</h4>
                        <p className="text-base text-gray-700 mb-2">
                        {topSummaries.how_to_improve}
                        </p>
                        <p className="text-sm italic text-gray-500"> Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                    </div>
                </section>
                
                {/* Feedback Summaries */}
                {/* ... existing feedback summary sections go here ... */}
                <section className="w-full max-w-5xl mb-6">
                    <h3 className="text-2xl font-semibold mb-4 text-center">Feedback Summaries</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Content Production */}
                        <div className="p-4 bg-yellow-50 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold mb-2">Content Production</h4>
                        <p className="text-sm font-semibold mb-1">TL;DR: High-level actionable feedback</p>
                        <ul className="list-disc ml-4 text-sm text-gray-700 space-y-1">
                            <li>“Stream quality could be improved for a better viewing experience.”</li>
                            <li>“Audio quality is great—your mic setup is working well.”</li>
                            <li>“Your RuneScape and Minecraft streams are especially fun and engaging.”</li>
                        </ul>
                        </div>

                        {/* Community Management */}
                        <div className="p-4 bg-purple-50 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold mb-2">Community Management</h4>
                        <p className="text-sm font-semibold mb-1">TL;DR: High-level actionable feedback</p>
                        <ul className="list-disc ml-4 text-sm text-gray-700 space-y-1">
                            <li>“Try to engage more with the chat, especially when you’re on call with friends.”</li>
                            <li>“Consider adding more moderators to manage chat and control spammers.”</li>
                            <li>“A consistent schedule could help in retaining regular viewers.”</li>
                        </ul>
                        </div>

                        {/* Marketing Strategies */}
                        <div className="p-4 bg-blue-50 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold mb-2">Marketing Strategies</h4>
                        <p className="text-sm font-semibold mb-1">TL;DR: High-level actionable feedback</p>
                        <ul className="list-disc ml-4 text-sm text-gray-700 space-y-1">
                            <li>“Promote your unique streaming style on social media to attract new viewers.”</li>
                            <li>“Collaborating with friends while streaming could bring in more engaged audiences.”</li>
                            <li>“Consider sharing clips from your fun moments in RuneScape and Minecraft to build interest.”</li>
                        </ul>
                        </div>
                    </div>
                </section> 

                {/* Stats Placeholder */}
                <section className="w-full max-w-5xl mb-10">
                    <h3 className="text-2xl font-semibold mb-4 text-center">StreamFeed Response Stats</h3>
                    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col md:flex-row items-center justify-around">
                    <div className="text-center mb-4 md:mb-0">
                        <h4 className="text-xl font-semibold text-gray-800">Total Responses</h4>
                        <p className="text-lg font-semibold text-green-600">8</p>
                    </div>
                    <div className="text-center mb-4 md:mb-0">
                        <h4 className="text-xl font-semibold text-gray-800">Positive Feedback</h4>
                        <p className="text-lg font-semibold text-blue-600">75%</p>
                    </div>
                    <div className="text-center">
                        <h4 className="text-xl font-semibold text-gray-800">Improvement Suggestions</h4>
                        <p className="text-lg font-semibold text-red-600">25%</p>
                    </div>
                    </div>
                </section>
            </div>
          ) : (
            <div className="feedback-list">
              {chatMessages.map((message, index) => (
                <div key={index} className="p-2 mb-2 bg-white rounded-lg shadow">
                  <p>{message.message}</p>
                </div>
              ))}
            </div>
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
