import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';

import './App.css'
// import Feedback from './pages/Feedback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:streamer" element={<Chat />} /> {/* Dynamic route for streamer */}
        {/* <Route path="/feedback" element={<Feedback />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
