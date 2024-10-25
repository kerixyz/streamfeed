import React from 'react';

const Research = () => {
  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 md:px-6 bg-white">
      
      {/* Hero Section */}
      <section className="w-full max-w-4xl text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Exploring the Future of Streaming Feedback</h1>
        <p className="text-lg text-gray-700">
          Learn more about the insights driving StreamFeed and how we're working to make feedback more useful for creators.
        </p>
      </section>

      {/* Prior Work Section */}
      <section className="w-full max-w-4xl mb-12">
        <h2 className="text-3xl font-semibold mb-6">Prior Work</h2>
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Understanding Viewer Feedback Dynamics</h3>
          <p className="text-gray-700 mb-2">
            This study explored how streamers can better understand the types of feedback viewers provide and how they can use it to improve their content.
          </p>
          <a
            href="https://example.com/research1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Read more
          </a>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Stream Analytics Needs Study</h3>
          <p className="text-gray-700 mb-2">
            We worked with a group of streamers to identify the most critical metrics they want to track, focusing on engagement and community growth.
          </p>
          <a
            href="https://example.com/research2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Read more
          </a>
        </div>
      </section>

      {/* Upcoming Work Section */}
      <section className="w-full max-w-4xl mb-12">
        <h2 className="text-3xl font-semibold mb-6">Upcoming Work</h2>
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Automated Feedback Summaries</h3>
          <p className="text-gray-700 mb-2">
            We're developing an AI-powered tool that will summarize viewer feedback in real-time, helping streamers identify patterns and areas for improvement.
          </p>
          <p className="text-gray-700">Expected Impact: Provide streamers with quick, actionable insights without overwhelming them.</p>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Experimenting with New Metrics</h3>
          <p className="text-gray-700 mb-2">
            We're testing new metrics like sentiment analysis and feedback frequency to offer streamers a deeper look into viewer reactions.
          </p>
          <p className="text-gray-700">Expected Impact: Allow streamers to better understand the mood and engagement of their audiences.</p>
        </div>
      </section>
    </div>
  );
};

export default Research;
