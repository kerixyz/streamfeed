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

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  // client.chat.completions.create
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' }, // System message for context
        { role: 'user', content: message } // User's message
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    res.json({ reply: response.choices[0].message.content }); // Use message.content to get the reply
  } catch (error) {
    console.error('Error connecting to OpenAI:', error);
    res.status(500).json({ error: 'An error occurred while communicating with OpenAI.' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
