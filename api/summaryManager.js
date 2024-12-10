const OpenAI = require('openai');
const pool = require('./db');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSummaries(streamerName) {
  try {
    // Fetch chat messages from the database for the specified streamer
    const result = await pool.query(
      'SELECT message FROM chat_messages WHERE streamer_name ILIKE $1',
      [streamerName]
    );

    const messages = result.rows.map(row => row.message).join('\n');

    if (!messages) {
      throw new Error('No messages found for the specified streamer.');
    }

    // Generate summaries using OpenAI
    const response = await openai.completions.create({
      model: 'gpt-4',
      prompt: `
        The following is a conversation between a bot and a user. The bot asks targeted questions to gather feedback about a livestreamer. The user's responses are feedback about the streamer's content, engagement, and overall performance. Your task is to analyze this exchange and summarize the feedback into five categories.
    
        Here are the categories:
        1. **Why Viewers Watch**: Summarize the reasons viewers enjoy or are drawn to the streamer.
        2. **How to Improve**: Identify actionable suggestions for the streamer to improve their content or engagement.
        3. **Content Production**: Extract feedback specifically related to the streamer's content creation, such as video quality, gameplay, or creativity.
        4. **Community Management**: Highlight feedback about how the streamer engages with or manages their community, including chat interaction or viewer inclusion.
        5. **Marketing Strategy**: Summarize insights about how the streamer promotes their channel, such as through social media, collaborations, or branding.
    
        Below is the conversation. Use both the bot's questions and the user's responses to provide context for your summaries:
    
        ${messages}
    
        Please return the output in the following structured format:
    
        - Why Viewers Watch:
        - How to Improve:
        - Content Production:
        - Community Management:
        - Marketing Strategy:
      `,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const output = response.choices[0]?.text?.trim();

    if (!output) {
      throw new Error('OpenAI returned an empty response.');
    }

    if (!output.includes('- Why Viewers Watch:')) {
      throw new Error('Unexpected OpenAI response format.');
    }

    const categories = output.split('\n');

    const summaries = {
      why_viewers_watch: categories[0]?.trim() || 'No summary available',
      how_to_improve: categories[1]?.trim() || 'No summary available',
      content_production: categories[2]?.trim() || 'No summary available',
      community_management: categories[3]?.trim() || 'No summary available',
      marketing_strategy: categories[4]?.trim() || 'No summary available',
    };

    // Save summaries to the database
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

    console.log(`Summaries successfully generated for streamer: ${streamerName}`);
    return summaries;
  } catch (error) {
    console.error(`Error generating summaries for streamer: ${streamerName}`, error);
    throw error;
  }
}

module.exports = { generateSummaries };
