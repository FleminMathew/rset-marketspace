const fetch = require('node-fetch');

async function summarizeReviews(reviews) {
    const cohereApiKey = process.env.COHERE_API_KEY;
    if (!cohereApiKey) {
        console.error("Cohere API key not found.");
        return "Could not generate summary.";
    }
    if (!reviews || reviews.length === 0) {
        return "No reviews yet.";
    }

    // Format reviews into a single block of text for the prompt
    const reviewTexts = reviews.map(r => `- "${r.comment}" (Rating: ${r.rating}/5)`).join('\n');

    // Construct the prompt for the Chat API
    const prompt = `Based on the following user reviews for a rental item, provide a concise, one-sentence summary highlighting the main pros and cons. Do not mention specific user names.

Reviews:
${reviewTexts}

Summary:`;

    try {
        const response = await fetch('https://api.cohere.ai/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cohereApiKey}`,
            },
            body: JSON.stringify({
                // Using the latest high-performance model from the provided list.
                model: 'command-a-03-2025', 
                message: prompt,
                max_tokens: 100,
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Cohere API error: ${response.status} ${errorBody}`);
        }

        const data = await response.json();
        // The Chat API returns the result in the 'text' field
        return data.text.trim();

    } catch (error) {
        console.error('Error in summarizeReviews:', error);
        return "AI summary is currently unavailable.";
    }
}

module.exports = { summarizeReviews };

