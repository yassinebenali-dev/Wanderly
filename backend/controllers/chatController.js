const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const { checkLimit, incrementUsage } = require('./subscriptionController');

function getSystemPrompt(destination, budget, interests) {
  const interestLabels = {
    nightlife: 'Nightlife (bars, clubs, live music)',
    sports: 'Sports (stadiums, activities, local sports culture)',
    cinema: 'Cinema & Arts (theaters, galleries, cultural venues)',
    adventure: 'Adventure (hiking, extreme sports, outdoor activities)',
    relaxing: 'Relaxing (spas, beaches, peaceful spots)',
    food: 'Food & Culinary (local cuisine, cooking classes, food tours)',
    shopping: 'Shopping (markets, boutiques, local crafts)',
    culture: 'Culture & History (museums, historical sites, traditions)',
    nature: 'Nature (parks, wildlife, scenic views)',
    photography: 'Photography (Instagram spots, scenic locations, unique architecture)',
  };

  let prompt = `You are Wanderly, an expert AI travel companion. You help users plan amazing trips with personalized recommendations for accommodation, dining, activities, and culture.`;

  if (destination) {
    prompt += `\n\nYou are currently helping the user explore ${destination}. ALL recommendations MUST be specific to ${destination}. Never suggest places in other cities.`;
  }

  if (budget) {
    prompt += `\n\nThe user's budget is $${budget} USD. Tailor all recommendations to fit within this budget and mention approximate costs.`;
  }

  if (interests && interests.length > 0) {
    const list = interests.map(i => interestLabels[i] || i).join(', ');
    prompt += `\n\nThe user's interests are: ${list}. Prioritize recommendations related to these interests.`;
  }

  prompt += `\n\nYour personality is warm, enthusiastic, and helpful. Keep responses concise but informative. Use bullet points for lists. Use emojis sparingly.`;

  return prompt;
}

exports.chat = async (req, res) => {
  const { messages, destination, budget, interests } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required' });
  }
  if (req.user?.id) {
  const limitCheck = await checkLimit(req.user.id, 'chat_messages');
  if (!limitCheck.allowed) {
    return res.status(429).json({
      error: limitCheck.message,
      limitReached: true,
      field: 'chat_messages'
    });
  }
  await incrementUsage(req.user.id, 'chat_messages');
}
  try {
    const systemPrompt = getSystemPrompt(destination, budget, interests);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        const data = JSON.stringify({
          choices: [{ delta: { content: text } }],
        });
        res.write(`data: ${data}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to get AI response' });
    }
  }
};