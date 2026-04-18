const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const normalizeDestination = (destination) => {
  return destination
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const correctDestinationName = async (destination) => {
  try {
    const prompt = `You are a geography expert. The user typed a travel destination: "${destination}".

Your job is to return the correct official English name of this city/country/place.
Rules:
- Fix any typos or spelling mistakes
- Convert to proper English name (roma → Rome, paris → Paris)
- Remove double letters that don't belong (tokyoo → Tokyo, pariss → Paris)
- If it is a country, return the country name
- Return ONLY the corrected name, absolutely nothing else
- No punctuation, no explanation, no extra words
- Just the name

User input: "${destination}"
Correct name:`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 20,
      temperature: 0,
    });

    const corrected = response.choices[0].message.content.trim();
    return corrected || normalizeDestination(destination);
  } catch (err) {
    console.error('Destination correction error:', err);
    return normalizeDestination(destination);
  }
};

module.exports = { normalizeDestination, correctDestinationName };