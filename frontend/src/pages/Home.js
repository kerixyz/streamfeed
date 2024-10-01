import React from 'react';
const Home = () => {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1>Welcome to the Home Page</h1>
        <p>We'll help you get constructive feedback on your live streams.

          <b>Automated Feedback:</b> Evalubot will automatically collect responses from members of your server, so all you need to do is invite it to your server.
          <b>Filter & Evaluation:</b> Evalubot uses filters to provide quality assurance for responses, which it then synthesizes into high-level feedback topics.
          <b>Feedback Report:</b> Receive a detailed report about the strengths and weaknesses of your content, presence, interactions, and marketing. </p>
                  
        <a href="/chat" className="btn btn-primary mt-3">Go to Chat</a>
        <a href="/feedback" className="btn btn-secondary mt-3 ms-2">View Feedback</a>
      
      </div>

      <p>What is this and How does it work?
        We built a tool called Evalubot to solicit constructive feedback and synthesize the results into actionable insights for you as a streamer! We just ask to have a quick call with you to go over the results, and we'll compensate your time with gifted subscriptions to your channel</p>
    </div>
  );
};

export default Home;
