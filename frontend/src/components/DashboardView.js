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

  const [topNewcSummaries, setTopNewcSummaries] = useState({
    why_viewers_watch: 'Loading...',
    how_to_improve: 'Loading...',
    content_production: 'Loading...',
    community_management: 'Loading...',
    marketing_strategy: 'Loading...',
  });
  const [newcQuotes, setNewcQuotes] = useState({
    why_viewers_watch: [],
    how_to_improve: [],
    content_production: [],
    community_management: [],
    marketing_strategy: [],
  });
  const [newcCount, setNewcCount] = useState(0);



  useEffect(() => {
    if (streamer) {
      fetchChatMessages();
      fetchSummaries();
      fetchNewcSummaries();
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

  const fetchNewcSummaries = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-newc-summaries`, {
        params: { streamerName: streamer },
      });

      console.log('API Newc Response for Summaries:', response.data);

      if (response.data.success && response.data.summaries) {
        const summaries = response.data.summaries;

        setTopNewcSummaries({
          why_viewers_watch: summaries.why_viewers_watch || 'No summary available',
          how_to_improve: summaries.how_to_improve || 'No summary available',
          content_production: summaries.content_production || 'No summary available',
          community_management: summaries.community_management || 'No summary available',
          marketing_strategy: summaries.marketing_strategy || 'No summary available',
        });

        setNewcQuotes({
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

        setNewcCount(response.data.uniqueUsers || 0);
      } else {
        console.error('Summaries not found or incomplete response:', response.data);
      }
    } catch (error) {
      console.error('Error Newc fetching summaries:', error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-chat-messages`, {
        params: { streamerName: streamer },
      });

      const userMessages = response.data.messages.filter((msg) => msg.role === 'user');
      setChatMessages(userMessages);

      // console.log('Fetched chat messages:', userMessages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-start py-8 px-8 bg-gray-50">
      <h2 className="text-3xl font-semibold mb-4">Streamer Dashboard</h2>

      <div className="flex mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'viewer' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('viewer')}
        >
          Community
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'external' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('external')}
        >
          Newcomers
        </button>
      </div>

      {activeTab === 'viewer' && (
        <section className="w-full max-w-7xl mb-6">
          {chatMessages.length === 0 ? (
            <div className="p-4 rounded-lg">
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
              {/* Overview Section */}
              <section className="w-full max-w-7xl mb-8">
                <h1 className="text-3xl font-bold mb-6">Overview</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* # of Viewers */}
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <h4 className="text-lg font-medium text-gray-500"># of viewers</h4>
                    <p className="text-5xl font-bold text-gray-900 mt-4">{viewerCount}</p>
                  </div>

                  {/* Why Your Viewers Watch You */}
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <h4 className="text-lg font-medium text-gray-500">Why your viewers watch you</h4>
                    <p className="text-sm text-gray-700 mt-4">
                      {topSummaries?.why_viewers_watch || 'No summary available'}
                    </p>
                  </div>

                  {/* How You Can Improve */}
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <h4 className="text-lg font-medium text-gray-500">How you can improve</h4>
                    <p className="text-sm text-gray-700 mt-4">
                      {topSummaries?.how_to_improve || 'No summary available'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Feedback Summary Section */}
              <section className="w-full max-w-7xl mb-8">
                <h2 className="text-xl font-bold mb-6">Feedback Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { category: 'Content Production', summary: topSummaries.content_production, quotes: quotes.content_production },
                    { category: 'Community Management', summary: topSummaries.community_management, quotes: quotes.community_management },
                    { category: 'Marketing Strategy', summary: topSummaries.marketing_strategy, quotes: quotes.marketing_strategy },
                  ].map(({ category, summary, quotes }) => (
                    <div key={category} className="p-6 bg-white rounded-lg shadow-md">
                      <h4 className="text-lg font-medium text-gray-900">{category}</h4>
                      <p className="text-sm text-gray-700 mt-4">{summary || 'No summary available'}</p>
                      <div className="mt-4 border-t pt-4 space-y-2">
                        {quotes?.map((quote, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            "{quote}"
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </section>
      )}

      {activeTab === 'external' && (
        <>
          {/* Overview Section */}
          <section className="w-full max-w-7xl mb-8">
            <h1 className="text-3xl font-bold mb-6">Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* # of Viewers */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-gray-500"># of viewers</h4>
                <p className="text-5xl font-bold text-gray-900 mt-4">{newcCount}</p>
              </div>

              {/* Why Your Viewers Watch You */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-gray-500">Why your viewers watch you</h4>
                <p className="text-sm text-gray-700 mt-4">
                  {topNewcSummaries?.why_viewers_watch || 'No summary available'}
                </p>
              </div>

              {/* How You Can Improve */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-gray-500">How you can improve</h4>
                <p className="text-sm text-gray-700 mt-4">
                  {topNewcSummaries?.how_to_improve || 'No summary available'}
                </p>
              </div>
            </div>
          </section>

          {/* Feedback Summary Section */}
          <section className="w-full max-w-7xl mb-8">
            <h2 className="text-xl font-bold mb-6">Feedback Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { category: 'Content Production', summary: topNewcSummaries.content_production, quotes: newcQuotes.content_production },
                { category: 'Community Management', summary: topNewcSummaries.community_management, quotes: newcQuotes.community_management },
                { category: 'Marketing Strategy', summary: topNewcSummaries.marketing_strategy, quotes: newcQuotes.marketing_strategy },
              ].map(({ category, summary, quotes }) => (
                <div key={category} className="p-6 bg-white rounded-lg shadow-md">
                  <h4 className="text-lg font-medium text-gray-900">{category}</h4>
                  <p className="text-sm text-gray-700 mt-4">{summary || 'No summary available'}</p>
                  <div className="mt-4 border-t pt-4 space-y-2">
                    {quotes?.map((quote, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        "{quote}"
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>

  );
};

export default DashboardView;
