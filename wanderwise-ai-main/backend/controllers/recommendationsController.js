const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

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
    budgetContext = `The user's total budget is $${budget}. Suggest options around $${perNight}/night.`;
  }

  const prompt = `You are a travel accommodation expert. ${budgetContext}
Provide 6 accommodation recommendations for ${destination}.
Respond ONLY with valid JSON, no markdown:
{
  "accommodations": [
    {
      "name": "Hotel Name",
      "category": "Luxury Hotel",
      "rating": 4.8,
      "reviewCount": 1250,
      "priceLevel": 3,
      "price": "$$$",
      "description": "Brief description",
      "address": "Full address",
      "tags": ["Tag1", "Tag2"]
    }
  ]
}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
  });

  const content = response.choices[0].message.content.trim()
    .replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();

  const parsed = JSON.parse(content);
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
    tags: acc.tags,
  }));
}

async function fetchHistoryAI(destination, interests) {
  const prompt = `You are a travel historian. Provide historical and cultural information about ${destination}.
${interests?.length ? `The user is interested in: ${interests.join(', ')}.` : ''}
Respond ONLY with valid JSON, no markdown, no code blocks:
{
  "title": "The Story of ${destination}",
  "content": "2-3 paragraphs about the city history and culture.",
  "traditions": [
    { "name": "Tradition Name", "description": "Brief description" }
  ]
}
Include exactly 3 traditions.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.choices[0].message.content.trim()
    .replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();

  return JSON.parse(content);
}

async function fetchAllAI(destination, budget, interests) {
  const prompt = `You are a travel data API. Generate realistic travel recommendations for ${destination}.
${budget ? `User budget: $${budget} USD.` : ''}
${interests?.length ? `User interests: ${interests.join(', ')}.` : ''}

Respond ONLY with valid JSON, no markdown, no code blocks:
{
  "destination": "${destination}",
  "accommodations": [
    { "id": "acc-1", "name": "", "type": "accommodation", "category": "", "rating": 4.5, "reviewCount": 100, "priceLevel": 2, "price": "$$", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=90", "description": "", "address": "", "distance": "", "tags": [] }
  ],
  "restaurants": [
    { "id": "rest-1", "name": "", "type": "restaurant", "category": "", "rating": 4.5, "reviewCount": 100, "priceLevel": 2, "price": "$$", "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=90", "description": "", "address": "", "distance": "", "tags": [] }
  ],
  "activities": [
    { "id": "act-1", "name": "", "type": "activity", "category": "", "rating": 4.5, "reviewCount": 100, "priceLevel": 2, "price": "$$", "image": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=90", "description": "", "address": "", "distance": "", "tags": [] }
  ],
  "landmarks": [
    { "id": "land-1", "name": "", "type": "landmark", "category": "", "rating": 4.5, "reviewCount": 100, "priceLevel": 1, "price": "Free", "image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=90", "description": "", "address": "", "distance": "", "tags": [] }
  ],
  "history": {
    "title": "",
    "content": "",
    "traditions": [
      { "name": "", "description": "" }
    ]
  }
}
Generate 4 items each for accommodations, restaurants, activities, and landmarks. Include 3 traditions.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
  });

  const content = response.choices[0].message.content.trim()
    .replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();

  return JSON.parse(content);
}

exports.getRecommendations = async (req, res) => {
  const { destination, budget, interests } = req.body;

  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  try {
    const activityQuery = interests?.length
      ? `${interests.slice(0, 2).join(' ')} in ${destination}`
      : `things to do in ${destination}`;

    const [accommodations, restaurantsRaw, activitiesRaw, landmarksRaw, history] = await Promise.all([
      fetchAccommodationsAI(destination, budget),
      fetchFromSerpApi(`restaurants in ${destination}`),
      fetchFromSerpApi(activityQuery),
      fetchFromSerpApi(`landmarks in ${destination}`),
      fetchHistoryAI(destination, interests),
    ]);

    const restaurants = restaurantsRaw.slice(0, 6).map((p, i) => transformPlace(p, 'restaurant', i, destination));
    const activities = activitiesRaw.slice(0, 6).map((p, i) => transformPlace(p, 'activity', i, destination));
    const landmarks = landmarksRaw.slice(0, 6).map((p, i) => transformPlace(p, 'landmark', i, destination));

    return res.json({
      destination,
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
      const data = await fetchAllAI(destination, budget, interests);
      return res.json({ ...data, dataSource: 'ai' });
    } catch (aiErr) {
      console.error('AI fallback failed:', aiErr);
      return res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  }
};