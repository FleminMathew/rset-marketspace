const fetch = require('node-fetch');

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_API_URL = 'https://api.cohere.ai/v1/summarize';

async function summarizeReviews(reviews) {
    // If there are no reviews, return a default message.
    if (!reviews || reviews.length === 0) {
        return 'No reviews yet to summarize.';
    }
    // If the API key is not set, return a message indicating that.
    if (!COHERE_API_KEY) {
        console.warn("COHERE_API_KEY is not set. Returning manual summary.");
        // Provide a simple manual summary if the API key is missing
        return `This item has ${reviews.length} review(s). The average rating is not yet calculated.`;
    }

    // Join all review comments into a single string.
    const textToSummarize = reviews.join('\n');

    try {
        const response = await fetch(COHERE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${COHERE_API_KEY}`,
            },
            body: JSON.stringify({
                text: textToSummarize,
                length: 'short',
                format: 'paragraph',
                model: 'command',
                extractiveness: 'low',
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Cohere API Error:', errorBody);
            throw new Error(`Cohere API responded with status: ${response.status}`);
        }

        const data = await response.json();
        return data.summary;

    } catch (error) {
        console.error('Error in summarizeReviews:', error);
        // Fallback to a manual summary in case of an API error
        return `Could not generate an AI summary. There are ${reviews.length} reviews available.`;
    }
}

module.exports = { summarizeReviews };
