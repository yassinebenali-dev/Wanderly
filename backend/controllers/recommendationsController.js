const Groq = require('groq-sdk');
const pool = require('../config/db');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const { normalizeDestination, correctDestinationName } = require('../utils/destinationUtils');

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

const JSON_RULES = `
CRITICAL FORMATTING RULES - YOU MUST FOLLOW THESE EXACTLY:
1. Return ONLY raw JSON - no markdown, no backticks, no code blocks
2. No newlines or line breaks inside string values - use spaces instead
3. No apostrophes or single quotes inside strings - use spaces or rephrase
4. No special characters inside strings that could break JSON
5. Every string must be properly opened and closed with double quotes
6. Every array and object must be properly opened and closed
7. Do NOT truncate or cut off the response - complete the entire JSON
8. Do NOT add any text before or after the JSON
9. All property names must be in double quotes
10. Use only simple ASCII characters in all string values
`;

const cleanJson = (str) => {
  return str
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .trim();
};

const safeParseJson = (content) => {
  let parsed;
  try {
    parsed = JSON.parse(cleanJson(content));
  } catch (e) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(cleanJson(jsonMatch[0]));
      } catch (e2) {
        console.error('Failed to parse AI response:', e2.message);
        throw new Error('Invalid AI response format');
      }
    } else {
      throw new Error('No JSON found in AI response');
    }
  }
  return parsed;
};

const updateDestinationStats = async (destination) => {
  try {
    await pool.query(
      `INSERT INTO destination_stats (destination, search_count)
       VALUES (?, 1)
       ON DUPLICATE KEY UPDATE
       search_count = search_count + 1,
       last_searched = CURRENT_TIMESTAMP`,
      [destination]
    );
  } catch (err) {
    console.error('Stats update error:', err);
  }
};

const saveSearchHistory = async (userId, destination, budget, interests) => {
  if (!userId) return;
  try {
    await pool.query(
      `INSERT INTO search_history (user_id, destination, budget, interests)
       VALUES (?, ?, ?, ?)`,
      [userId, destination, budget || null, JSON.stringify(interests || [])]
    );
  } catch (err) {
    console.error('Save search history error:', err);
  }
};

const fallbackImages = {
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=90',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=90',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90',
  ],
  activity: [
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=90',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1200&q=90',
    'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200&q=90',
  ],
  landmark: [
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=90',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=90',
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=90',
  ],
  accommodation: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=90',
  ],
};

function getImage(thumbnail, type, index) {
  if (thumbnail) return thumbnail;
  const images = fallbackImages[type] || fallbackImages.activity;
  return images[index % images.length];
}

function parsePriceLevel(price) {
  if (!price) return 2;
  const count = (price.match(/\$/g) || []).length;
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

function generateTags(place, category) {
  const tags = [];
  if (place.type) tags.push(place.type);
  if (place.rating >= 4.7) tags.push('Highly Rated');
  if (place.reviews >= 5000) tags.push('Popular');
  if (place.price === '$') tags.push('Budget-Friendly');
  if (place.price === '$$$') tags.push('Upscale');
  return tags.slice(0, 4);
}

async function fetchFromSerpApi(query) {
  const url = new URL(SERPAPI_BASE_URL);
  url.searchParams.set('engine', 'google_local');
  url.searchParams.set('q', query);
  url.searchParams.set('hl', 'en');
  url.searchParams.set('gl', 'us');
  url.searchParams.set('api_key', process.env.SERPAPI_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`SerpAPI error: ${response.status}`);
  const data = await response.json();
  return data.local_results || [];
}

function transformPlace(place, type, index, destination) {
  return {
    id: `${type}-${place.place_id || index}`,
    name: place.title,
    type,
    category: place.type || type,
    rating: place.rating || 4.0,
    reviewCount: place.reviews || 0,
    priceLevel: parsePriceLevel(place.price),
    price: place.price || '$$',
    image: getImage(place.thumbnail, type, index),
    description: place.description || `Discover ${place.title} in ${destination}.`,
    address: place.address || 'Address not available',
    openingHours: place.hours || null,
    link: `https://www.google.com/search?q=${encodeURIComponent(place.title + ' ' + destination)}`,
    tags: generateTags(place, type),
  };
}

async function fetchAccommodationsAI(destination, budget) {
  let budgetContext = '';
  if (budget) {
    const perNight = Math.round((budget * 0.4) / 5);
    budgetContext = `The user total budget is $${budget}. Suggest options around $${perNight} per night.`;
  }

  const prompt = `${JSON_RULES}

You are a travel accommodation expert. ${budgetContext}
Provide exactly 6 accommodation recommendations for ${destination}.

Return this exact JSON structure:
{
  "accommodations": [
    {
      "name": "Hotel Name",
      "category": "Luxury Hotel",
      "rating": 4.8,
      "reviewCount": 1250,
      "priceLevel": 3,
      "price": "$$$",
      "description": "Brief description using only simple words and no special characters",
      "address": "Full address in ${destination}",
      "tags": ["Tag1", "Tag2", "Tag3"]
    }
  ]
}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
    temperature: 0.3,
  });

  const content = response.choices[0].message.content.trim();
  const parsed = safeParseJson(content);

  return parsed.accommodations.map((acc, i) => ({
    id: `accommodation-${i}`,
    name: acc.name,
    type: 'accommodation',
    category: acc.category,
    rating: acc.rating,
    reviewCount: acc.reviewCount,
    priceLevel: acc.priceLevel,
    price: acc.price,
    image: fallbackImages.accommodation[0],
    description: acc.description,
    address: acc.address,
    link: `https://www.google.com/search?q=${encodeURIComponent(acc.name + ' ' + destination)}`,
    tags: acc.tags || [],
  }));
}

async function fetchHistoryAI(destination, interests) {
  const prompt = `${JSON_RULES}

You are a travel historian. Provide historical and cultural information about ${destination}.

Return this exact JSON structure:
{
  "title": "The Story of ${destination}",
  "content": "Write 2 to 3 paragraphs giving a global historical overview of ${destination}. Use only simple ASCII characters. No apostrophes. No special characters.",
  "traditions": [
    { "name": "Tradition Name", "description": "Brief description using simple words" },
    { "name": "Tradition Name", "description": "Brief description using simple words" },
    { "name": "Tradition Name", "description": "Brief description using simple words" }
  ]
}

Include exactly 3 traditions. The content must mention how the city relates to: ${interests?.length ? interests.join(', ') : 'general tourism'}.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.3,
  });

  const content = response.choices[0].message.content.trim();
  return safeParseJson(content);
}

async function fetchAllAI(destination, budget, interests) {
  const prompt = `${JSON_RULES}

You are a travel data API. Generate realistic travel recommendations for ${destination}.
${budget ? `User budget: $${budget} USD.` : ''}
${interests?.length ? `User interests: ${interests.join(', ')}.` : ''}

Return this exact JSON structure with exactly 4 items in each array:
{
  "destination": "${destination}",
  "accommodations": [
    { "id": "acc-1", "name": "Name", "type": "accommodation", "category": "Hotel", "rating": 4.5, "reviewCount": 100, "priceLevel": 2, "price": "$$", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=90", "description": "Simple description", "address": "Address in ${destination}", "distance": "2 km from center", "tags": ["tag1", "tag2"] }
  ],
  "restaurants": [
    { "id": "rest-1", "name": "Name", "type": "restaurant", "category": "Local Cuisine", "rating": 4.5, "reviewCount": 100, "priceLevel": 2, "price": "$$", "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=90", "description": "Simple description", "address": "Address in ${destination}", "distance": "1 km from center", "tags": ["tag1", "tag2"] }
  ],
  "activities": [
    { "id": "act-1", "name": "Name", "type": "activity", "category": "Sightseeing", "rating": 4.5, "reviewCount": 100, "priceLevel": 1, "price": "$", "image": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=90", "description": "Simple description", "address": "Address in ${destination}", "distance": "3 km from center", "tags": ["tag1", "tag2"] }
  ],
  "landmarks": [
    { "id": "land-1", "name": "Name", "type": "landmark", "category": "Historic Site", "rating": 4.7, "reviewCount": 500, "priceLevel": 1, "price": "Free", "image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=90", "description": "Simple description", "address": "Address in ${destination}", "distance": "1 km from center", "tags": ["tag1", "tag2"] }
  ],
  "history": {
    "title": "The Story of ${destination}",
    "content": "2 paragraphs about ${destination} history using simple ASCII characters only",
    "traditions": [
      { "name": "Tradition 1", "description": "Simple description" },
      { "name": "Tradition 2", "description": "Simple description" },
      { "name": "Tradition 3", "description": "Simple description" }
    ]
  }
}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 6000,
    temperature: 0.3,
  });

  const content = response.choices[0].message.content.trim();
  return safeParseJson(content);
}

exports.getRecommendations = async (req, res) => {
  const { destination, budget, interests } = req.body;

  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  const normalizedDestination = await correctDestinationName(destination);
  // Update search stats
  await updateDestinationStats(normalizedDestination);
  await saveSearchHistory(req.user?.id, normalizedDestination, budget, interests);

  try {
    const activityQuery = interests?.length
      ? `${interests.slice(0, 2).join(' ')} in ${normalizedDestination}`
      : `things to do in ${normalizedDestination}`;

    const [accommodations, restaurantsRaw, activitiesRaw, landmarksRaw, history] = await Promise.all([
      fetchAccommodationsAI(normalizedDestination, budget),
      fetchFromSerpApi(`restaurants in ${normalizedDestination}`),
      fetchFromSerpApi(activityQuery),
      fetchFromSerpApi(`landmarks in ${normalizedDestination}`),
      fetchHistoryAI(normalizedDestination, interests),
    ]);

    const restaurants = restaurantsRaw.slice(0, 6).map((p, i) => transformPlace(p, 'restaurant', i, normalizedDestination));
    const activities = activitiesRaw.slice(0, 6).map((p, i) => transformPlace(p, 'activity', i, normalizedDestination));
    const landmarks = landmarksRaw.slice(0, 6).map((p, i) => transformPlace(p, 'landmark', i, normalizedDestination));

    return res.json({
      destination: normalizedDestination,
      accommodations,
      restaurants,
      activities,
      landmarks,
      history,
      dataSource: 'serpapi',
    });
  } catch (err) {
    console.error('SerpAPI failed, falling back to AI:', err.message);

    try {
      const data = await fetchAllAI(normalizedDestination, budget, interests);
      return res.json({ ...data, dataSource: 'ai' });
    } catch (aiErr) {
      console.error('AI fallback failed:', aiErr);
      return res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  }
};