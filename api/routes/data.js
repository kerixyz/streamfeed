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
  const { streamerName } = req.body;

  // Generate a unique token for the streamer
  const token = generateToken();

  try {
    // Insert the session into the database
    await pool.query(
      'INSERT INTO sessions (streamer_name, token) VALUES ($1, $2)',
      [streamerName, token]
    );

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

// Route to save a chat message
router.post('/save-chat-message', async (req, res) => {
  const { userId, streamerName, message, role } = req.body;

  try {
    // Insert the message into the chat_messages table
    await pool.query(
      'INSERT INTO chat_messages (user_id, streamer_name, message, role, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [userId, streamerName, message, role]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving message to database:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Old Route to fetch all chat messages for a streamer
// router.get('/get-chat-messages', async (req, res) => {
//   const { streamerName } = req.query;

// //   console.log('Fetching messages for streamer:', streamerName); // Log the streamer name for debugging

//   try {
//     const result = await pool.query(
//       'SELECT * FROM chat_messages WHERE streamer_name = $1 ORDER BY created_at ASC',
//       [streamerName]
//     );
    
//     // Log the result from the database
//     // console.log('Messages from database:', result.rows);

//     if (result.rows.length > 0) {
//       res.json({ messages: result.rows });
//     } else {
//       res.json({ messages: [] });
//     }
//   } catch (err) {
//     console.error('Error fetching chat messages:', err);
//     res.status(500).json({ error: 'Failed to fetch messages' });
//   }
// });
router.get('/get-chat-messages', async (req, res) => {
    const { userId, streamerName } = req.query;
  
    try {
      const result = await pool.query(
        'SELECT * FROM chat_messages WHERE streamer_name = $1 AND user_id = $2 ORDER BY created_at ASC',
        [streamerName, userId]
      );
  
      if (result.rows.length > 0) {
        res.json({ messages: result.rows });
      } else {
        res.json({ messages: [] });
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });
  

// Route to save the user's assigned version
router.post('/save-user-version', async (req, res) => {
    const { userId, version } = req.body;
  
    try {
      await pool.query(
        'INSERT INTO user_versions (user_id, version) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET version = $2',
        [userId, version]
      );
      res.json({ success: true });
    } catch (err) {
      console.error('Error saving user version:', err);
      res.status(500).json({ error: 'Failed to save user version' });
    }
  });
  
  // Route to fetch the user's assigned version
  router.get('/get-user-version', async (req, res) => {
    const { userId } = req.query;
  
    try {
      const result = await pool.query(
        'SELECT version FROM user_versions WHERE user_id = $1',
        [userId]
      );
  
      if (result.rows.length > 0) {
        res.json({ version: result.rows[0].version });
      } else {
        res.json({ version: null });
      }
    } catch (err) {
      console.error('Error retrieving user version:', err);
      res.status(500).json({ error: 'Failed to retrieve user version' });
    }
  });


//this was the original code that should essentially just show the data in the website lol but it kept breaking or not loading but keeping it here anyway
// router.get('/data', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM chatbot_db');
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Database connection error', err); // Log the error details
//     res.status(500).json({ error: 'Database error', details: err.message });
//   }
// });

module.exports = router;
