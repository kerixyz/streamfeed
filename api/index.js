const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();
const pool = require('./db'); // Import database connection

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const dataRoutes = require('./routes/data');
app.use('/api', dataRoutes);

const conversationState = {};

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

function getFeedbackQuestion(category, streamerName) {
  const feedbackCategories = {
    communityManagement: `How do you feel about the community management on ${streamerName}'s stream? Are the chat rules fair, and is moderation effective?`,
    contentProduction: `What do you think about the content production quality on ${streamerName}'s stream? Are the videos engaging and well-edited? Is the streaming setup professional?`,
    marketingStrategies: `How effective do you think ${streamerName}'s marketing strategies are? Are the social media promotions appealing and engaging?`
  };
  return feedbackCategories[category];
}

const categoriesOrder = ['communityManagement', 'contentProduction', 'marketingStrategies'];

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
  await saveMessage(userId, message, 'user'); // Save user's message

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
