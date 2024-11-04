//setting up user permission and roels for the project 
const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto')

require('dotenv').config();
// console.log("DATABASE_URL", process.env.DATABASE_URL)

//temporary storage
let streamers = {};

//helper function for generateToken
function generateToken(){
  return crypto.randomBytes(16).toString('hex');
}

router.get('/test-db', async(req,res) => {
  try{
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  }catch(err){
    console.error('Database connection error:', err);
    res.status(500).json({error:'database error', details:err.message});
  }
});

// Route for streamers to create a session
router.post('/create-session', async (req, res) => {
  const { streamerName, feedbackFromViewers, feedbackFromExternal } = req.body;

  // Generate a unique token for the streamer
  const token = generateToken();

  try {
    // Insert the session into the database
    await pool.query(
      'INSERT INTO sessions (streamer_name, token, feedback_from_viewers, feedback_from_external) VALUES ($1, $2, $3, $4)',
      [streamerName, token, feedbackFromViewers, feedbackFromExternal]
    );
    console.log("Received values:", { streamerName, feedbackFromViewers, feedbackFromExternal });


    // Send back the unique link for the streamer to access their dashboard
    res.json({
      link: `/chat/${streamerName}?token=${token}`,
      token: token
    });
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Route to verify if a token is valid for accessing the dashboard
router.get('/verify-dashboard-access', async (req, res) => {
  const { streamerName, token } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE streamer_name = $1 AND token = $2',
      [streamerName, token]
    );

    if (result.rows.length > 0) {
      res.json({ valid: true });
    } else {
      res.status(401).json({ valid: false, message: 'Unauthorized access' });
    }
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

// Route to save a chat message with category
router.post('/save-chat-message', async (req, res) => {
    const { userId, streamerName, message, role, category } = req.body;
  
    try {
      // Insert the message into the chat_messages table
      await pool.query(
        'INSERT INTO chat_messages (user_id, streamer_name, message, role, category, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [userId, streamerName, message, role, category]
      );
      res.json({ success: true });
    } catch (err) {
      console.error('Error saving message to database:', err);
      res.status(500).json({ error: 'Failed to save message' });
    }
  });
  
// Route to fetch chat messages filtered by streamer name (userId is optional)
router.get('/get-chat-messages', async (req, res) => {
    const { userId, streamerName } = req.query;
    
    try {
      let query = 'SELECT * FROM chat_messages WHERE streamer_name = $1';
      const params = [streamerName];
  
      if (userId) {
        query += ' AND user_id = $2';
        params.push(userId);
      }
  
      query += ' ORDER BY created_at ASC';
  
      const result = await pool.query(query, params);
  
      res.json({ messages: result.rows });
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });
  
// Route to save the user's assigned version
router.post('/save-user-version', async (req, res) => {
    const { userId, version, streamerName } = req.body;
  
    try {
      await pool.query(
        'INSERT INTO user_versions (user_id, version, streamer_name) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET version = $2, streamer_name = $3',
        [userId, version, streamerName]
      );
      res.json({ success: true });
    } catch (err) {
      console.error('Error saving user version:', err);
      res.status(500).json({ error: 'Failed to save user version' });
    }
});
  
// Route to fetch the user's assigned version and streamer name
router.get('/get-user-version', async (req, res) => {
    const { userId } = req.query;
  
    try {
      const result = await pool.query(
        'SELECT version, streamer_name FROM user_versions WHERE user_id = $1',
        [userId]
      );
  
      if (result.rows.length > 0) {
        res.json({ version: result.rows[0].version, streamerName: result.rows[0].streamer_name });
      } else {
        res.json({ version: null, streamerName: null });
      }
    } catch (err) {
      console.error('Error retrieving user version:', err);
      res.status(500).json({ error: 'Failed to retrieve user version' });
    }
});

module.exports = router;