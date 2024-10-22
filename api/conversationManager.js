// conversationManager.js
const conversationState = {};

// Categories and feedback types for the manual version
const categories = ["marketing strategies", "content production", "community management"];
const feedbackTypes = ["strengths", "improvements"];

// Function to generate dynamic and adaptive questions for the manual version
function generateQuestion(category, feedbackType, streamerName) {
  const strengthsPhrases = [
    `What do you think are ${streamerName}'s strengths when it comes to ${category}?`,
    `In terms of ${category}, what stands out to you as ${streamerName}'s biggest strengths?`,
    `How would you describe ${streamerName}'s strengths in their approach to ${category}?`,
    `What aspects of ${category} do you think ${streamerName} excels at?`
  ];

  const improvementsPhrases = [
    `Where do you think ${streamerName} could improve in terms of ${category}?`,
    `Are there any areas in ${category} where you think ${streamerName} could do better?`,
    `What suggestions do you have for ${streamerName} to enhance their ${category}?`,
    `How could ${streamerName} improve their efforts in ${category}?`
  ];

  // Randomly select a phrase based on the feedback type
  if (feedbackType === "strengths") {
    return strengthsPhrases[Math.floor(Math.random() * strengthsPhrases.length)];
  } else {
    return improvementsPhrases[Math.floor(Math.random() * improvementsPhrases.length)];
  }
}

// Function to generate clarifying questions
function generateClarifyingQuestion(feedbackType) {
  if (feedbackType === "strengths") {
    return "Can you provide more details about why this is a strength and how it impacts the stream positively?";
  } else {
    return "Can you clarify how this improvement can be implemented or why it’s important for the stream?";
  }
}

// Function to check if a response is overly negative
function isNegative(response) {
    const negativeKeywords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'useless'];
    return negativeKeywords.some(keyword => response.toLowerCase().includes(keyword));
}
  
// Function to check if a response is unhelpful
function isUnhelpful(response) {
    const vagueKeywords = ['okay', 'fine', 'good', 'bad', 'meh', 'average'];
    return vagueKeywords.some(keyword => response.toLowerCase().includes(keyword));
}
  
// Function to check if a response is constructive
function isConstructive(response, feedbackType, userState) {
    const trimmedResponse = response.trim();
    const minLengthCheck = trimmedResponse.length >= 5;  // Specificity check (min 5 characters)

    // Justification check only for strengths
    const justificationCheck =
        feedbackType === "strengths"
        ? /because|due to|as a result/.test(trimmedResponse.toLowerCase())
        : true;

    // Actionability check only for improvements
    const actionabilityCheck =
        feedbackType === "improvements"
        ? /should|could|need to|try to/.test(trimmedResponse.toLowerCase())
        : true;

    // Prevent repeated responses (e.g., copy-pasting)
    const isRepeatedResponse = userState.previousResponses.includes(trimmedResponse);

    // Add the current response to the list of previous responses
    userState.previousResponses.push(trimmedResponse);

    return minLengthCheck && justificationCheck && actionabilityCheck && !isRepeatedResponse;
}
  
// Main function to handle user messages
async function handleMessage(userId, message, openai, streamerName = 'the streamer') {
    if (!conversationState[userId]) {
        const assignedVersion = assignVersion();
        conversationState[userId] = {
        version: assignedVersion,
        messages: [],
        awaitingConfirmation: true,
        currentCategoryIndex: 0,
        currentFeedbackType: 0,
        streamerName,
        awaitingFirstFeedback: true,
        previousResponses: []  // Store previous responses to prevent repetition
        };

        const introMessage = `Hi, I'm Evalubot to help gather feedback for ${streamerName}. 
                            I'll ask you some questions that we'll provide to the streamer 
                            and researchers studying this prototype. 
                            Reply with 'ok' to continue.`;
        conversationState[userId].messages.push({ role: 'assistant', content: introMessage });
        return introMessage;
    }

const userState = conversationState[userId];

// Handle end of conversation
if (message.toLowerCase() === 'end') {
    delete conversationState[userId];
    return 'Thank you for using Evalubot! If you need more assistance, feel free to start a new conversation.';
}

// Handle user confirmation
if (userState.awaitingConfirmation) {
    if (message.toLowerCase() === 'ok') {
    userState.awaitingConfirmation = false;
    userState.awaitingFirstFeedback = true;
    } else {
    return "Please reply with 'ok' to continue.";
    }
}

// Route the conversation to the assigned version
if (userState.version === 'manual') {
    return await handleManualVersion(userId, message, streamerName);
} else {
    return await handleAdaptiveVersion(userId, message, openai);
}
}

// Function to handle the manual version
async function handleManualVersion(userId, message, streamerName) {
    const userState = conversationState[userId];

    // Add the user message to the conversation history
    userState.messages.push({ role: 'user', content: message });

    // Ensure the first feedback question is asked before checking constructiveness
    if (userState.awaitingFirstFeedback) {
        userState.awaitingFirstFeedback = false;

        // Generate the first feedback question
        const firstCategory = categories[userState.currentCategoryIndex];
        const firstFeedbackType = feedbackTypes[userState.currentFeedbackType];
        const firstQuestion = generateQuestion(firstCategory, firstFeedbackType, streamerName);
        userState.messages.push({ role: 'assistant', content: firstQuestion });

        return firstQuestion;
    }

    // Check if the response is overly negative
    if (isNegative(message)) {
        const negativeResponsePrompt = "That's pretty negative, could you rephrase that?";
        userState.messages.push({ role: 'assistant', content: negativeResponsePrompt });
        return negativeResponsePrompt;
    }

    // Check if the response is unhelpful
    if (isUnhelpful(message)) {
        const unhelpfulResponsePrompt = "That's not really helpful, could you rephrase that?";
        userState.messages.push({ role: 'assistant', content: unhelpfulResponsePrompt });
        return unhelpfulResponsePrompt;
    }

    // Check if the response is constructive with the new criteria
    const feedbackType = feedbackTypes[userState.currentFeedbackType];
    if (!isConstructive(message, feedbackType, userState)) {
        const clarifyingQuestion = generateClarifyingQuestion(feedbackType);
        userState.messages.push({ role: 'assistant', content: clarifyingQuestion });
        return clarifyingQuestion;
    }

    // Move to the next feedback type or category
    if (userState.currentFeedbackType < feedbackTypes.length - 1) {
        userState.currentFeedbackType++;
    } else if (userState.currentCategoryIndex < categories.length - 1) {
        userState.currentCategoryIndex++;
        userState.currentFeedbackType = 0;
    } else {
        const finalResponse = "Thank you for all your feedback! If you have more comments, type 'end' to finish or continue with additional feedback.";
        userState.messages.push({ role: 'assistant', content: finalResponse });
        return finalResponse;
    }

    // Generate the next question dynamically
    const nextCategory = categories[userState.currentCategoryIndex];
    const nextFeedbackType = feedbackTypes[userState.currentFeedbackType];
    const nextQuestion = generateQuestion(nextCategory, nextFeedbackType, streamerName);
    userState.messages.push({ role: 'assistant', content: nextQuestion });

    return nextQuestion;
}

// Function to handle the adaptive version
async function handleAdaptiveVersion(userId, message, openai) {
  const userState = conversationState[userId];

  // Add the user message to the conversation history
  userState.messages.push({ role: 'user', content: message });

  // If it's the first message in adaptive mode, create the initial prompt
  if (userState.messages.length === 1) {
    userState.messages = createAdaptivePrompt(userState.streamerName);
  }

  // Call OpenAI's ChatGPT for response
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: userState.messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    const botReply = response.choices[0].message.content;
    userState.messages.push({ role: 'assistant', content: botReply });

    return botReply;
  } catch (error) {
    console.error('Error connecting to OpenAI:', error);
    return 'An error occurred while communicating with Evalubot. Please try again later.';
  }
}

// Helper function to create the initial system prompt for the adaptive version
function createAdaptivePrompt(streamerName) {
    return [
      {
        role: 'system',
        content: `You are Evalubot, a chatbot that gathers feedback about streamers. 
                  Your goal is to guide users to provide feedback on ${streamerName} 
                  across three categories: marketing strategies, content production, 
                  and community management. For each category, ask about strengths and improvements. 
                  
                  Feedback should be constructive, which means:
                  - Specific: The response should have at least 5 characters.
                  - Justifiable: For strengths, users should explain why it's a strength (e.g., using phrases like "because" or "due to").
                  - Actionable: For improvements, users should suggest how the streamer could improve (e.g., using phrases like "should" or "could").
  
                  If a response is overly negative (e.g., uses words like "terrible", "useless", etc.), respond with 
                  "That's pretty negative, could you rephrase that?". 
  
                  If a response is too vague (e.g., "okay", "fine", etc.), respond with 
                  "That's not really helpful, could you rephrase that?".
  
                  If a response does not meet the criteria for constructiveness, prompt the user to provide more details 
                  or clarify their feedback.`
      }
    ];
}
  
// Function to randomly assign a version
function assignVersion() {
  return Math.random() < 0.5 ? 'manual' : 'adaptive';
}

module.exports = { handleMessage };
