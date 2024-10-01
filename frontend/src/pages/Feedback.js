import React from 'react';
import DataComponent from '../components/DataComponent';

const Feedback = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center">Feedback Analytics</h1>
      <p className="text-center">This page will display feedback analytics for the chatbot.</p>
      {/* Add your analytics content here */}
      <DataComponent>
        
      </DataComponent>
    </div>
  );
};

export default Feedback;
