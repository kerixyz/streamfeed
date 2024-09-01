import React from 'react';

const Home = () => {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1>Welcome to the Home Page</h1>
        <p>This is the landing page of your application.</p>
        <a href="/chat" className="btn btn-primary mt-3">Go to Chat</a>
        <a href="/feedback" className="btn btn-secondary mt-3 ms-2">View Feedback</a>
      </div>
    </div>
  );
};

export default Home;
