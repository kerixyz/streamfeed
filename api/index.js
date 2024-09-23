const express = require('express');
const cors = require('cors');
const OpenAI = require('openai'); // Use the latest import method
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize conversation state storage (in-memory object, can be replaced with a database)
const conversationState = {};

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

// Function to get feedback question dynamically based on the streamer name
// narrowing this down a bit more
function getFeedbackQuestion(category, streamerName) {
  const feedbackCategories = {
    communityManagement: `How do you feel about the community management on ${streamerName}'s stream? Are the chat rules fair, and is moderation effective?`,
    contentProduction: `What do you think about the content production quality on ${streamerName}'s stream? Are the videos engaging and well-edited? Is the streaming setup professional?`,
    marketingStrategies: `How effective do you think ${streamerName}'s marketing strategies are? Are the social media promotions appealing and engaging?`
  };
  return feedbackCategories[category];
}

// Categories for feedback
const categoriesOrder = ['communityManagement', 'contentProduction', 'marketingStrategies'];

// API endpoint for chat interaction
app.post('/api/chat', async (req, res) => {
  const { userId, message } = req.body;

  // Check if user exists in conversation state
  if (!conversationState[userId]) {
    // Initialize new conversation state for user
    conversationState[userId] = {
      messages: [
        { role: 'system', content: 'You are Evalubot, an assistant that helps users provide constructive feedback about streamers. Feedback should be specific, actionable, and justifiable.' }
      ],
      currentCategoryIndex: 0,
      streamerName: null,
    };

    // Initial bot message asking for the streamer's name
    const initialBotMessage = 'Hello! I’m Evalubot. I’d like to help you provide feedback about a streamer. Which streamer would you like to give feedback on today?';
    conversationState[userId].messages.push({ role: 'assistant', content: initialBotMessage });

    return res.json({ reply: initialBotMessage });
  }

  const userState = conversationState[userId];

  // Special command to end the conversation
  if (message.toLowerCase() === 'end') {
    delete conversationState[userId];
    return res.json({ reply: 'Thank you for using Evalubot! If you need more assistance, feel free to start a new conversation.' });
  }

  // If the streamer name is not yet set, assume the next message contains the streamer's name
  if (!userState.streamerName) {
    userState.streamerName = message; // Capture the streamer's name from the user's message

    // Ask the first feedback question
    const firstQuestion = getFeedbackQuestion(categoriesOrder[userState.currentCategoryIndex], userState.streamerName);
    userState.messages.push({ role: 'assistant', content: firstQuestion });
    userState.currentCategoryIndex++;

    return res.json({ reply: firstQuestion });
  }

  // Add user's message to conversation
  userState.messages.push({ role: 'user', content: message });

  // If more categories are left, ask the next question
  if (userState.currentCategoryIndex < categoriesOrder.length) {
    const nextQuestion = getFeedbackQuestion(categoriesOrder[userState.currentCategoryIndex], userState.streamerName);
    userState.messages.push({ role: 'assistant', content: nextQuestion });
    userState.currentCategoryIndex++;

    return res.json({ reply: nextQuestion });
  } else {
    // If all categories have been covered, handle additional feedback or end conversation
    const finalResponse = "Thank you for all your feedback! If you have more comments, type 'end' to finish or continue with additional feedback.";
    userState.messages.push({ role: 'assistant', content: finalResponse });

    return res.json({ reply: finalResponse });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
