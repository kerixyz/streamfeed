const { generateSummaries } = require('./summaryManager');

(async () => {
  const streamerName = 'ediamondhunter11'; // Replace with your test streamer name
  try {
    console.log(`Triggering generateSummaries for streamer: ${streamerName}`);
    const summaries = await generateSummaries(streamerName);
    console.log('Summaries generated successfully:', summaries);
  } catch (error) {
    console.error('Error generating summaries:', error);
  }
})();
