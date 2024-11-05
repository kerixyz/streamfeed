require('dotenv').config();

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./db'); 
const app = express();

const conversationManager = require('./conversationManager');

const apiUrl = process.env.API_URL || 'http://localhost:5001/api';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const dataRoutes = require('./routes/data');
app.use('/api', dataRoutes);

app.use((req, res, next) => {
    const isHttps = req.headers['x-forwarded-proto'] === 'https';
    const isWww = req.headers.host.startsWith('www.');

    if (!isHttps || !isWww) {
        return res.redirect(`https://www.streamfeed.xyz${req.url}`);
    }

    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' https://www.streamfeed.xyz; script-src 'self'; style-src 'self';"
    );
    next();
});

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const { userId, message } = req.body;

    try {
        // Get or assign user's version
        let userVersion = await getUserVersion(userId);
        if (!userVersion) {
            userVersion = assignVersion(); // Assign random version ('manual' or 'adaptive')
        }

        // Handle message based on the assigned version
        const reply = await conversationManager.handleMessage(userId, message, openai, 'the streamer');
        await saveMessage(userId, message, 'user', userVersion); // Save user's message with version info
        await saveMessage(userId, reply, 'assistant', userVersion); // Save bot's reply with version info

        return res.json({ reply });
    } catch (error) {
        console.error('Error processing chat:', error);
        return res.status(500).json({ error: 'An error occurred while processing the chat.' });
    }
});

// Save messages in chat_messages table with version info
async function saveMessage(userId, message, role, version) {
    try {
        await pool.query(
            'INSERT INTO chat_messages (user_id, message, role, version) VALUES ($1, $2, $3, $4)',
            [userId, message, role, version]
        );
    } catch (err) {
        console.error('Error saving message to database:', err);
    }
}

// Fetch user's assigned version directly from chat_messages
async function getUserVersion(userId) {
    try {
        const result = await pool.query(
            'SELECT version FROM chat_messages WHERE user_id = $1 LIMIT 1',
            [userId]
        );
        return result.rows.length ? result.rows[0].version : null;
    } catch (err) {
        console.error('Error retrieving user version from database:', err);
        return null;
    }
}

app.get('/get-chat-summaries', async (req, res) => {
    const { streamerName } = req.query;

    try {
        const totalMessages = await pool.query(`
            SELECT COUNT(*) AS total_messages
            FROM chat_messages
            WHERE streamer_name = $1
        `, [streamerName]);

        const messagesByCategory = await pool.query(`
            SELECT category, COUNT(*) AS count
            FROM chat_messages
            WHERE streamer_name = $1
            GROUP BY category
        `, [streamerName]);

        res.json({
            total_messages: totalMessages.rows[0].total_messages,
            messages_by_category: Object.fromEntries(messagesByCategory.rows.map(row => [row.category, row.count])),
        });
    } catch (error) {
        console.error('Error fetching summaries:', error);
        res.status(500).send('Server Error');
    }
});

async function countUniqueUsers(streamerName) {
    try {
        const result = await pool.query(
            `SELECT COUNT(DISTINCT user_id) AS unique_user_count
             FROM chat_messages
             WHERE streamer_name = $1`,
            [streamerName]
        );
        console.log(`Unique user count for ${streamerName}:`, result.rows[0].unique_user_count);
        return result.rows[0].unique_user_count;
    } catch (error) {
        console.error("Error counting unique users:", error);
        throw new Error("Failed to count unique users.");
    }
}

app.post('/generate-category-summaries', async (req, res) => {
    const { streamerName } = req.body;

    try {
        const uniqueUserCount = await countUniqueUsers(streamerName);
        if (uniqueUserCount < 5) {
            console.log(`Not enough unique users (${uniqueUserCount}) to generate summaries for ${streamerName}`);
            return res.status(200).json({ message: 'Not enough unique users for summary generation yet.' });
        }

        const messages = await getUserFeedback(streamerName);
        const categories = await categorizeFeedbackWithOpenAI(messages);
        const categorySummaries = await generateCategorySummaries(categories);
        const highLevelSummaries = await generateHighLevelSummaries(messages);

        console.log(`Generated summaries for ${streamerName}`, { categorySummaries, highLevelSummaries });
        res.json({ categorySummaries, highLevelSummaries });
    } catch (error) {
        console.error("Error generating summaries:", error);
        res.status(500).json({ error: 'Failed to generate summaries' });
    }
});

async function generateHighLevelSummaries(messages) {
    const combinedMessages = messages.join('\n');
    const prompts = {
        why_viewers_watch: `Summarize why viewers might enjoy watching the streamer based on the following feedback:\n${combinedMessages}`,
        how_to_improve: `Provide general suggestions for how the streamer could improve based on the following feedback:\n${combinedMessages}`,
    };

    const summaries = {};

    for (const [key, prompt] of Object.entries(prompts)) {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150,
                temperature: 0.7,
            });

            summaries[key] = response.choices[0].message.content;
        } catch (error) {
            console.error(`Error generating ${key} summary:`, error);
            summaries[key] = "Error generating summary.";
        }
    }

    return summaries;
}

async function categorizeFeedbackWithOpenAI(messages) {
    const categories = {
        content_production: [],
        community_management: [],
        marketing_strategies: [],
    };

    for (const message of messages) {
        const prompt = `Classify the following feedback into one of these categories: content production, community management, or marketing strategies. Feedback: "${message}"`;
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 50,
                temperature: 0.3,
            });

            const category = response.choices[0].message.content.toLowerCase();

            if (category.includes("content production")) {
                categories.content_production.push(message);
            } else if (category.includes("community management")) {
                categories.community_management.push(message);
            } else if (category.includes("marketing strategies")) {
                categories.marketing_strategies.push(message);
            }
        } catch (error) {
            console.error("Error categorizing message:", error);
        }
    }

    return categories;
}
