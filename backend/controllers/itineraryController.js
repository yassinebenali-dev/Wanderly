const pool = require('../config/db');
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const JSON_RULES = `
CRITICAL FORMATTING RULES:
1. Return ONLY raw JSON - no markdown, no backticks, no code blocks
2. No newlines or line breaks inside string values - use spaces instead
3. No apostrophes or single quotes inside strings
4. No special characters inside strings
5. Every string must be properly opened and closed with double quotes
6. Every array and object must be properly opened and closed
7. Do NOT truncate the response - complete the entire JSON
8. Do NOT add any text before or after the JSON
9. Use only simple ASCII characters in all string values
`;

async function generateItineraryAI(destination, nbDays, budget, interests) {
  const prompt = `${JSON_RULES}

You are a professional travel planner. Create a detailed day-by-day itinerary for ${destination} for ${nbDays} days.
${budget ? `Total budget: $${budget} USD.` : ''}
${interests?.length ? `User interests: ${interests.join(', ')}.` : ''}

Return this exact JSON structure:
{
  "destination": "${destination}",
  "nb_days": ${nbDays},
  "days": [
    {
      "day": 1,
      "title": "Arrival and First Impressions",
      "morning": {
        "time": "9:00 AM",
        "activity": "Activity name",
        "description": "Brief description",
        "location": "Place name",
        "duration": "2 hours",
        "cost": "$10"
      },
      "afternoon": {
        "time": "2:00 PM",
        "activity": "Activity name",
        "description": "Brief description",
        "location": "Place name",
        "duration": "3 hours",
        "cost": "$20"
      },
      "evening": {
        "time": "7:00 PM",
        "activity": "Activity name",
        "description": "Brief description",
        "location": "Place name",
        "duration": "2 hours",
        "cost": "$30"
      },
      "tip": "A useful local tip for this day"
    }
  ],
  "total_estimated_cost": "$500",
  "best_transport": "Metro and walking",
  "general_tips": "General travel tips for ${destination}"
}
Generate exactly ${nbDays} days. Keep descriptions simple with no special characters.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 6000,
    temperature: 0.3,
  });

  const content = response.choices[0].message.content.trim()
    .replace(/```json/g, '').replace(/```/g, '')
    .replace(/[\x00-\x1F\x7F]/g, ' ').trim();

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, ' '));
    } else {
      throw new Error('Invalid AI response format');
    }
  }
  return parsed;
}

// Generate itinerary (without saving)
exports.generateItinerary = async (req, res) => {
  const { destination, nb_days, budget, interests } = req.body;

  if (!destination || !nb_days) {
    return res.status(400).json({ error: 'Destination and number of days are required' });
  }

  try {
    const itinerary = await generateItineraryAI(destination, nb_days, budget, interests);
    res.json(itinerary);
  } catch (err) {
    console.error('Generate itinerary error:', err);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
};

// Save itinerary linked to a saved destination
exports.saveItinerary = async (req, res) => {
  const { saved_destination_id, itinerary, nb_days } = req.body;

  if (!saved_destination_id || !itinerary || !nb_days) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check that saved destination belongs to user
    const [rows] = await pool.query(
      'SELECT id FROM saved_destinations WHERE id = ? AND user_id = ?',
      [saved_destination_id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if itinerary already exists
    const [existing] = await pool.query(
      'SELECT id FROM itineraries WHERE saved_destination_id = ?',
      [saved_destination_id]
    );

    if (existing.length > 0) {
      // Update existing
      await pool.query(
        'UPDATE itineraries SET itinerary = ?, nb_days = ? WHERE saved_destination_id = ?',
        [JSON.stringify(itinerary), nb_days, saved_destination_id]
      );
    } else {
      // Insert new
      await pool.query(
        'INSERT INTO itineraries (saved_destination_id, itinerary, nb_days) VALUES (?, ?, ?)',
        [saved_destination_id, JSON.stringify(itinerary), nb_days]
      );
    }

    res.json({ message: 'Itinerary saved successfully' });
  } catch (err) {
    console.error('Save itinerary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get itinerary for a saved destination
exports.getItinerary = async (req, res) => {
  const { saved_destination_id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT i.* FROM itineraries i
       JOIN saved_destinations sd ON sd.id = i.saved_destination_id
       WHERE i.saved_destination_id = ? AND sd.user_id = ?`,
      [saved_destination_id, req.user.id]
    );

    if (rows.length === 0) {
      return res.json({ itinerary: null });
    }

    const row = rows[0];
    res.json({
      ...row,
      itinerary: typeof row.itinerary === 'string' ? JSON.parse(row.itinerary) : row.itinerary,
    });
  } catch (err) {
    console.error('Get itinerary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};