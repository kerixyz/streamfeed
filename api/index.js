require('dotenv').config();

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./db'); 
const app = express();

// Set up API and frontend URLs based on environment
const apiUrl = process.env.API_URL || 'http://localhost:5001/api';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// CORS setup to allow frontend URL
app.use(cors({
  origin: frontendUrl,
}));

app.use(express.json());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Load API routes
const dataRoutes = require('./routes/data');
app.use('/api', dataRoutes);

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https://secure-dusk-86046-23b5df488cf4.herokuapp.com; script-src 'self'; style-src 'self';"
  );
  next();
});

// //handling the root route path
// app.get('/', (req, res) => {
//   res.send('Welcome to the API!');  // Simple response for root URL
// });

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')));

// Serve index.html for any unknown routes
app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const conversationState = {};

// Chatbot route
app.post('/api/chat', async (req, res) => {
  const { userId, message } = req.body;

  if (!conversationState[userId]) {
    conversationState[userId] = {
      messages: [
        { role: 'system', content: 'You are Evalubot, an assistant that helps users provide constructive feedback about streamers. Feedback should be specific, actionable, and justifiable.' }
      ],
      currentCategoryIndex: 0,
      streamerName: null,
    };

    const initialBotMessage = 'Hello! I’m Evalubot. I’d like to help you provide feedback about a streamer. Which streamer would you like to give feedback on today?';
    conversationState[userId].messages.push({ role: 'assistant', content: initialBotMessage });

    // Save the initial bot message to the database
    await saveMessage(userId, initialBotMessage, 'assistant');

    return res.json({ reply: initialBotMessage });
  }

  const userState = conversationState[userId];

  if (message.toLowerCase() === 'end') {
    delete conversationState[userId];
    return res.json({ reply: 'Thank you for using Evalubot! If you need more assistance, feel free to start a new conversation.' });
  }

  if (!userState.streamerName) {
    userState.streamerName = message;

    const firstQuestion = getFeedbackQuestion(categoriesOrder[userState.currentCategoryIndex], userState.streamerName);
    userState.messages.push({ role: 'assistant', content: firstQuestion });
    userState.currentCategoryIndex++;

    // Save the user's message and the bot's first question to the database
    await saveMessage(userId, message, 'user');
    await saveMessage(userId, firstQuestion, 'assistant');

    return res.json({ reply: firstQuestion });
  }

  userState.messages.push({ role: 'user', content: message });
  await saveMessage(userId, message, 'user'); 

  if (userState.currentCategoryIndex < categoriesOrder.length) {
    const nextQuestion = getFeedbackQuestion(categoriesOrder[userState.currentCategoryIndex], userState.streamerName);
    userState.messages.push({ role: 'assistant', content: nextQuestion });
    userState.currentCategoryIndex++;

    // Save the bot's next question to the database
    await saveMessage(userId, nextQuestion, 'assistant');

    return res.json({ reply: nextQuestion });
  } else {
    const finalResponse = "Thank you for all your feedback! If you have more comments, type 'end' to finish or continue with additional feedback.";
    userState.messages.push({ role: 'assistant', content: finalResponse });

    // Save the final bot message to the database
    await saveMessage(userId, finalResponse, 'assistant');

    return res.json({ reply: finalResponse });
  }
});

// Function to save messages to the database
async function saveMessage(userId, message, role) {
  try {
    await pool.query(
      'INSERT INTO chat_messages (user_id, message, role) VALUES ($1, $2, $3)',
      [userId, message, role]
    );
  } catch (err) {
    console.error('Error saving message to database:', err);
  }
}

// Helper function to get chatbot response
async function getChatbotResponse(messages) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error connecting to OpenAI:', error);
    throw new Error('An error occurred while communicating with OpenAI.');
  }
}
