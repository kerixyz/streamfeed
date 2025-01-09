import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

const DashboardView = ({ streamer }) => {
  const [activeTab, setActiveTab] = useState('viewer');
  const [chatMessages, setChatMessages] = useState([]);
  const [topSummaries, setTopSummaries] = useState({
    why_viewers_watch: 'Loading...',
    how_to_improve: 'Loading...',
    content_production: 'Loading...',
    community_management: 'Loading...',
    marketing_strategy: 'Loading...',
  });
  const [quotes, setQuotes] = useState({
    why_viewers_watch: [],
    how_to_improve: [],
    content_production: [],
    community_management: [],
    marketing_strategy: [],
  });
  const [viewerCount, setViewerCount] = useState(0);

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

      console.log('API Response for Summaries:', response.data);

      if (response.data.success && response.data.summaries) {
        const summaries = response.data.summaries;

        setTopSummaries({
          why_viewers_watch: summaries.why_viewers_watch || 'No summary available',
          how_to_improve: summaries.how_to_improve || 'No summary available',
          content_production: summaries.content_production || 'No summary available',
          community_management: summaries.community_management || 'No summary available',
          marketing_strategy: summaries.marketing_strategy || 'No summary available',
        });

        setQuotes({
          why_viewers_watch: summaries.why_viewers_watch_quotes
            ? summaries.why_viewers_watch_quotes.split('\n').filter((q) => q.trim() !== '')
            : [],
          how_to_improve: summaries.how_to_improve_quotes
            ? summaries.how_to_improve_quotes.split('\n').filter((q) => q.trim() !== '')
            : [],
          content_production: summaries.content_production_quotes
            ? summaries.content_production_quotes.split('\n').filter((q) => q.trim() !== '')
            : [],
          community_management: summaries.community_management_quotes
            ? summaries.community_management_quotes.split('\n').filter((q) => q.trim() !== '')
            : [],
          marketing_strategy: summaries.marketing_strategy_quotes
            ? summaries.marketing_strategy_quotes.split('\n').filter((q) => q.trim() !== '')
            : [],
        });

        setViewerCount(response.data.uniqueUsers || 0);
      } else {
        console.error('Summaries not found or incomplete response:', response.data);
      }
    } catch (error) {
      console.error('Error fetching summaries:', error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-chat-messages`, {
        params: { streamerName: streamer },
      });

      const userMessages = response.data.messages.filter((msg) => msg.role === 'user');
      setChatMessages(userMessages);

      console.log('Fetched chat messages:', userMessages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-gray-50">
      <h2 className="text-3xl font-semibold mb-4 text-center">Streamer Dashboard</h2>

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
              <section className="w-full max-w-5xl mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg shadow-md border-l-4" style={{ borderColor: '#56e8ad' }}>
                    <h4 className="text-xl font-semibold mb-1">Why Your Viewers Watch You</h4>
                    <p className="text-base text-gray-700 mb-2">
                      {topSummaries?.why_viewers_watch || 'No summary available'}
                    </p>
                    <ul className="list-disc ml-4">
                      {quotes?.why_viewers_watch?.map((quote, index) => (
                        <li key={index} className="text-sm text-gray-600">"{quote}"</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg shadow-md border-l-4" style={{ borderColor: '#ff8280' }}>
                    <h4 className="text-xl font-semibold mb-1">How You Can Improve</h4>
                    <p className="text-base text-gray-700 mb-2">
                      {topSummaries?.how_to_improve || 'No summary available'}
                    </p>
                    <ul className="list-disc ml-4">
                      {quotes?.how_to_improve?.map((quote, index) => (
                        <li key={index} className="text-sm text-gray-600">"{quote}"</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="w-full max-w-5xl mb-6">
                <h4 className="text-2xl font-semibold mb-4 text-center">Summaries from {viewerCount} viewers</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { category: 'Content Production', summary: topSummaries.content_production, quotes: quotes.content_production },
                    { category: 'Community Management', summary: topSummaries.community_management, quotes: quotes.community_management },
                    { category: 'Marketing Strategy', summary: topSummaries.marketing_strategy, quotes: quotes.marketing_strategy },
                  ].map(({ category, summary, quotes }) => (
                    <div key={category} className="p-4 bg-gray-100 rounded-lg shadow-md">
                      <h4 className="text-lg font-semibold mb-2">{category}</h4>
                      <p className="text-base text-gray-700 mb-2">{summary || 'No summary available'}</p>
                      <ul className="list-disc ml-4">
                        {quotes?.map((quote, index) => (
                          <li key={index} className="text-sm text-gray-600">"{quote}"</li>
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

      {activeTab === 'external' && (
        <section className="w-full max-w-5xl mb-6">
          <p>External feedback content will go here (coming soon).</p>
        </section>
      )}
    </div>
  );
};

export default DashboardView;
