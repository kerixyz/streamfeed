// chatHandler.js

const OpenAI = require('openai'); // Use the latest import method
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize conversation state storage (could be a database in a real-world scenario)
const conversationState = {};

// Helper function to get chatbot response
async function getChatbotResponse(messages) {
  try {
    console.log('Sending request to OpenAI:', messages); // Debug log
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 100,
      temperature: 0.7,
    });

    console.log('Received response from OpenAI:', response); // Debug log
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error connecting to OpenAI:', error);
    throw new Error('An error occurred while communicating with OpenAI.');
  }
}

// Function to get feedback questions dynamically based on the streamer name
function getFeedbackQuestion(category, streamerName) {
  console.log(`Getting feedback question for category: ${category}, streamer: ${streamerName}`); // Debug log
  const feedbackCategories = {
    communityManagement: `How do you feel about the community management on ${streamerName}'s stream? Are the chat rules fair, and is moderation effective?`,
    contentProduction: `What do you think about the content production quality on ${streamerName}'s stream? Are the videos engaging and well-edited? Is the streaming setup professional?`,
    marketingStrategies: `How effective do you think ${streamerName}'s marketing strategies are? Are the social media promotions appealing and engaging?`
  };
  return feedbackCategories[category];
}

const categoriesOrder = ['communityManagement', 'contentProduction', 'marketingStrategies'];

// Function to handle chat requests
async function handleChatRequest(userId, message) {
  console.log('Handling chat request:', { userId, message }); // Debug log

  if (!conversationState[userId]) {
    console.log(`Initializing conversation for new user: ${userId}`);

    conversationState[userId] = {
      messages: [
        { role: 'system', content: 'You are an assistant that helps users provide feedback about streamers. The goal is to collect constructive and actionable feedback that can help streamers improve their content and engagement.' }
      ],
      currentCategoryIndex: 0, // Start with the first category
      streamerName: null // Initialize streamerName as null
    };

    // Initial bot message asking for the streamer's name
    const initialBotMessage = 'Hello! I’d like to help you provide feedback about a streamer. Which streamer would you like to give feedback on today?';
    conversationState[userId].messages.push({ role: 'assistant', content: initialBotMessage });

    console.log('Returning initial bot message:', initialBotMessage); // Debug log
    return initialBotMessage;
  }

  const userState = conversationState[userId];

  // If the streamer name is not yet set, assume the next message contains the streamer's name
  if (!userState.streamerName) {
    userState.streamerName = message; // Capture the streamer's name from the user's message
    console.log(`Captured streamer name for user ${userId}: ${userState.streamerName}`);

    // Ask the first feedback question
    const firstQuestion = getFeedbackQuestion(categoriesOrder[userState.currentCategoryIndex], userState.streamerName);
    userState.messages.push({ role: 'assistant', content: firstQuestion });
    userState.currentCategoryIndex++;

    console.log('Returning first feedback question:', firstQuestion); // Debug log
    return firstQuestion;
  }

  // Add the user's message to the conversation state
  userState.messages.push({ role: 'user', content: message });

  // Determine if we need to move to the next question
  if (userState.currentCategoryIndex < categoriesOrder.length) {
    // Move to the next question
    const nextQuestion = getFeedbackQuestion(categoriesOrder[userState.currentCategoryIndex], userState.streamerName);

    // Update the conversation state
    userState.messages.push({ role: 'assistant', content: nextQuestion });
    userState.currentCategoryIndex++;

    console.log('Returning next feedback question:', nextQuestion); // Debug log
    return nextQuestion;
  } else {
    // If all categories have been covered, handle any additional feedback or end conversation
    const finalResponse = "Thank you for all your feedback! Is there anything else you'd like to add?";
    userState.messages.push({ role: 'assistant', content: finalResponse });
    
    console.log('Returning final response:', finalResponse); // Debug log
    return finalResponse;
  }
}

// Function to reset conversation state (optional, for more complex interactions)
function resetConversationState(userId) {
  delete conversationState[userId]; // Clear conversation state
  console.log(`Conversation state reset for user ${userId}`);
}

// Export functions for use in index.js
module.exports = { handleChatRequest, resetConversationState };
