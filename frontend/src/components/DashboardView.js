import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

const DashboardView = ({ streamer }) => {
  const [summaries, setSummaries] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [topSummaries, setTopSummaries] = useState({
    why_viewers_watch: 'Loading...',
    how_to_improve: 'Loading...',
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
      await generateTopSummaries(userMessages);  // Pass userMessages to the function
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
    <div className="min-h-screen flex flex-col items-center py-10 px-6 bg-white">
      <h2 className="text-4xl font-semibold mb-6">Streamer Dashboard</h2>

      {/* Top-Level Summaries */}
      <section className="w-full max-w-7xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Why Viewers Watch */}
          <div className="p-6 bg-green-100 rounded-lg shadow-lg">
            <h4 className="text-2xl font-semibold mb-2">Why Your Viewers Watch You</h4>
            <p className="text-lg">{topSummaries.why_viewers_watch}</p>
          </div>

          {/* How You Can Improve */}
          <div className="p-6 bg-red-100 rounded-lg shadow-lg">
            <h4 className="text-2xl font-semibold mb-2">How You Can Improve</h4>
            <p className="text-lg">{topSummaries.how_to_improve}</p>
          </div>
        </div>
      </section>

      {/* Detailed Category Summaries */}
      <section className="w-full max-w-7xl mb-8">
        <h3 className="text-3xl font-semibold mb-4">Detailed Summarization by Category</h3>
        {/* Add detailed summaries based on categories here */}
      </section>
    </div>
  );
};

export default DashboardView;
