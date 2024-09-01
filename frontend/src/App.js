import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Feedback from './pages/Feedback';
import './App.css'; // Import the global CSS
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Make a GET request to the backend API
    axios.get('http://localhost:500/api/example')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.error('There was an error making the request:', error);
      });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </Router>
  );
}

export default App;
