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
      
      Format your response as follows:
        ### Why Viewers Watch:
        Summary: <summary>
        Quotes:
        - "<quote>"

        ### How to Improve:
        Summary: <summary>
        Quotes:
        - "<quote>"

        ### Content Production:
        Summary: <summary>
        Quotes:
        - "<quote>"

        ### Community Management:
        Summary: <summary>
        Quotes:
        - "<quote>"

        ### Marketing Strategy:
        Summary: <summary>
        Quotes:
        - "<quote>"
    `;
    console.log('Sending prompt to OpenAI:', prompt);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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
  
    // Split the OpenAI response into sections by the '###' delimiter
    const categorySections = output.split('###').slice(1); // Ignore the first empty split

    const summaries = {};
    const quotes = {};

    // Process each category section
    categorySections.forEach(section => {
    const lines = section.trim().split('\n').filter(line => line.trim()); // Split into lines and remove empty/whitespace-only lines

    if (lines.length >= 2) {
        const categoryTitle = lines[0].trim().replace(':', ''); // Extract category title (e.g., "Why Viewers Watch")
        console.log('Processing category:', categoryTitle);

        // Match the summary
        const summaryIndex = lines.findIndex(line => line.startsWith('Summary:'));
        const quoteIndex = lines.findIndex(line => line.startsWith('Quotes:'));

        summaries[categoryTitle.toLowerCase().replace(/\s+/g, '_')] =
        summaryIndex >= 0 ? lines[summaryIndex].replace('Summary:', '').trim() : 'No summary available';

        quotes[categoryTitle.toLowerCase().replace(/\s+/g, '_')] =
        quoteIndex >= 0
            ? lines.slice(quoteIndex + 1).map(line => line.replace(/^-/, '').trim()) // Extract quotes after "Quotes:"
            : ['No quotes available'];
    }
    });

    console.log('Parsed Summaries:', summaries);
    console.log('Parsed Quotes:', quotes);

    // Save the summaries to the database
    await pool.query(
        `INSERT INTO chat_summaries 
          (streamer_name, why_viewers_watch, how_to_improve, content_production, community_management, marketing_strategy,
           why_viewers_watch_quotes, how_to_improve_quotes, content_production_quotes, community_management_quotes, marketing_strategy_quotes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (streamer_name) 
          DO UPDATE SET 
            why_viewers_watch = $2, 
            how_to_improve = $3, 
            content_production = $4, 
            community_management = $5, 
            marketing_strategy = $6,
            why_viewers_watch_quotes = $7,
            how_to_improve_quotes = $8,
            content_production_quotes = $9,
            community_management_quotes = $10,
            marketing_strategy_quotes = $11`,
        [
          streamerName,
          summaries.why_viewers_watch || 'No summary available',
          summaries.how_to_improve || 'No summary available',
          summaries.content_production || 'No summary available',
          summaries.community_management || 'No summary available',
          summaries.marketing_strategy || 'No summary available',
          quotes.why_viewers_watch?.join('\n') || 'No quotes available',
          quotes.how_to_improve?.join('\n') || 'No quotes available',
          quotes.content_production?.join('\n') || 'No quotes available',
          quotes.community_management?.join('\n') || 'No quotes available',
          quotes.marketing_strategy?.join('\n') || 'No quotes available',
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