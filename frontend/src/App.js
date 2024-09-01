import React, { useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Feedback from './pages/Feedback';
import './App.css'; // Import the global CSS
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  useEffect(() => {
    axios.get('http://localhost:500/api/example')
      .then(response => {
        // Handle the response if needed
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
