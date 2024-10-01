//setting up user permission and roels for the project 

const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto')

//temporary storage
let streamers = {};

//helper function for generateToken
function generateToken(){
  return crypto.randomBytes(16).toString('hex');
}

// Route for streamers to create a session
router.post('/create-session', (req, res) => {
  const { streamerName } = req.body;
  
  // Generate a unique token for the streamer
  const token = generateToken();

  // Save streamer and token to a storage (you can replace this with DB)
  streamers[streamerName] = { token };

  // Send back the unique link for the streamer to access their dashboard
  res.json({
      link: `https://yourapp.com/chat/${streamerName}?token=${token}`,
      token: token
  });
});

// Route to verify if a token is valid for accessing the dashboard
router.get('/verify-dashboard-access', (req, res) => {
  const { streamerName, token } = req.query;

  // Check if the token matches the stored token for this streamer
  if (streamers[streamerName] && streamers[streamerName].token === token) {
      res.json({ valid: true });
  } else {
      res.status(401).json({ valid: false, message: 'Unauthorized access' });
  }
});

router.get('/dashboard/:streamer', (req, res) => {
  const { streamer } = req.params;
  const { token } = req.query;

  // Validate the token
  if (streamers[streamer] && streamers[streamer].token === token) {
      // Provide access to the dashboard
      res.send('Welcome to your dashboard');
  } else {
      res.status(401).send('Unauthorized access');
  }
});


//this was the original code that should essentially just show the data in the website lol but it kept breaking or not loading but keeping it here anyway
router.get('/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chatbot_db');
    res.json(result.rows);
  } catch (err) {
    console.error('Database connection error', err); // Log the error details
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
