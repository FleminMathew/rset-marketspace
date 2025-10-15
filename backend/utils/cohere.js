const fetch = require('node-fetch');

const COHERE_API_KEY = process.env.COHERE_API_KEY;

// Function to get embedding for a text
async function getEmbedding(text) {
    if (!COHERE_API_KEY) {
        console.error("Cohere API key not found. Skipping embedding.");
        return null;
    }
    if (!text || typeof text !== 'string' || text.trim() === '') {
        return null;
    }

    try {
        const response = await fetch('https://api.cohere.ai/v1/embed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${COHERE_API_KEY}`,
            },
            body: JSON.stringify({
                texts: [text],
                model: 'embed-english-v3.0',
                input_type: 'search_document'
            }),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Cohere Embed API error: ${response.status} ${errorBody}`);
        }
        const data = await response.json();
        return data.embeddings[0];
    } catch (error) {
        console.error('Error in getEmbedding:', error);
        return null;
    }
}


async function summarizeReviews(reviews) {
    if (!COHERE_API_KEY) {
        console.error("Cohere API key not found.");
        return "Could not generate summary.";
    }
    if (!reviews || reviews.length === 0) {
        return "No reviews yet.";
    }

    const reviewTexts = reviews.map(r => `- "${r.comment}" (Rating: ${r.rating}/5)`).join('\n');
    const prompt = `Based on the following user reviews, provide a concise, one-sentence summary. Reviews:\n${reviewTexts}\n\nSummary:`;

    try {
        const response = await fetch('https://api.cohere.ai/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${COHERE_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'command-a-03-2025',
                message: prompt,
                max_tokens: 100,
                temperature: 0.3,
            }),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Cohere Chat API error: ${response.status} ${errorBody}`);
        }
        const data = await response.json();
        return data.text.trim();
    } catch (error) {
        console.error('Error in summarizeReviews:', error);
        return "AI summary is currently unavailable.";
    }
}

module.exports = { summarizeReviews, getEmbedding };

