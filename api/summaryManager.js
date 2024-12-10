const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./db'); 
const app = express();

require('dotenv').config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure the API key is set correctly in your environment
  });

async function generateSummaries(streamerName) {
    try {
      console.log(`Starting summary generation for streamer: ${streamerName}`);
  
      // Fetch messages for the streamer
      const result = await pool.query(
        'SELECT message FROM chat_messages WHERE streamer_name ILIKE $1',
        [streamerName]
      );
  
      const messages = result.rows.map(row => ({
        role: row.role, // 'user' or 'assistant'
        content: row.message,
      }));
      
      if (!messages.length) {
        console.log('No messages found for summarization.');
        return { error: 'No messages available for summarization.' };
      }
      
      console.log(`Fetched ${messages.length} messages for streamer: ${streamerName}`);
      
      // Create message text for the OpenAI prompt
      const messageText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      console.log('Prepared message text for OpenAI:', messageText);

      
      const prompt = `
      The following is a conversation between a bot and a user. The bot asks targeted questions to gather feedback about a livestreamer. The user's responses are feedback about the streamer's content, engagement, and overall performance. Summarize the feedback into five categories:
      1. Why Viewers Watch: Reasons viewers enjoy the streamer.
      2. How to Improve: Suggestions for the streamer to improve.
      3. Content Production: Feedback about content quality and creativity.
      4. Community Management: Feedback about engagement with viewers.
      5. Marketing Strategy: Insights about promotion and branding.
      
      Messages: ${messageText}      
      Provide summaries in this format:
      - Why Viewers Watch:
      - How to Improve:
      - Content Production:
      - Community Management:
      - Marketing Strategy:
    `;

    console.log('Sending prompt to OpenAI:', prompt);

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    console.log('OpenAI response received:', response);

    const output = response.choices[0]?.message?.content?.trim();
    if (!output) {
      throw new Error('OpenAI returned an empty response.');
    }

    console.log('OpenAI output:', output);
  
      // Parse the response into categories
      const categories = output.split('\n');
      const summaries = {
        why_viewers_watch: categories[0]?.trim() || 'No summary available',
        how_to_improve: categories[1]?.trim() || 'No summary available',
        content_production: categories[2]?.trim() || 'No summary available',
        community_management: categories[3]?.trim() || 'No summary available',
        marketing_strategy: categories[4]?.trim() || 'No summary available',
      };
  
      // Save the summaries to the database
      await pool.query(
        `INSERT INTO chat_summaries 
          (streamer_name, why_viewers_watch, how_to_improve, content_production, community_management, marketing_strategy)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (streamer_name) 
          DO UPDATE SET 
            why_viewers_watch = $2, 
            how_to_improve = $3, 
            content_production = $4, 
            community_management = $5, 
            marketing_strategy = $6`,
        [
          streamerName,
          summaries.why_viewers_watch,
          summaries.how_to_improve,
          summaries.content_production,
          summaries.community_management,
          summaries.marketing_strategy,
        ]
      );
  
      console.log(`Summaries successfully saved for streamer: ${streamerName}`);
      return summaries;
    } catch (error) {
      console.error(`Error generating summaries for streamer: ${streamerName}`, error);
      throw error;
    }
  }
  
  
  module.exports = { generateSummaries };