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

async function generateChecklistAI(destination, interests, budget) {
  const prompt = `${JSON_RULES}

You are a travel preparation expert. Generate a comprehensive packing and preparation checklist for a trip to ${destination}.
${interests?.length ? `User interests: ${interests.join(', ')}.` : ''}
${budget ? `Budget: $${budget} USD.` : ''}

Return this exact JSON structure:
{
  "categories": [
    {
      "name": "Documents",
      "icon": "file-text",
      "items": [
        { "id": "doc-1", "text": "Passport", "checked": false, "priority": "high" },
        { "id": "doc-2", "text": "Visa", "checked": false, "priority": "high" }
      ]
    },
    {
      "name": "Clothing",
      "icon": "shirt",
      "items": [
        { "id": "cloth-1", "text": "Comfortable walking shoes", "checked": false, "priority": "high" }
      ]
    },
    {
      "name": "Health & Safety",
      "icon": "heart",
      "items": [
        { "id": "health-1", "text": "Travel insurance", "checked": false, "priority": "high" }
      ]
    },
    {
      "name": "Electronics",
      "icon": "smartphone",
      "items": [
        { "id": "elec-1", "text": "Phone charger", "checked": false, "priority": "medium" }
      ]
    },
    {
      "name": "Money & Banking",
      "icon": "credit-card",
      "items": [
        { "id": "money-1", "text": "Notify bank of travel", "checked": false, "priority": "high" }
      ]
    }
  ]
}

Generate 4 to 6 items per category. Tailor items specifically for ${destination}. Priority must be either high medium or low.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
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

// Generate checklist without saving
exports.generateChecklist = async (req, res) => {
  const { destination, interests, budget } = req.body;

  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  try {
    const checklist = await generateChecklistAI(destination, interests, budget);
    res.json(checklist);
  } catch (err) {
    console.error('Generate checklist error:', err);
    res.status(500).json({ error: 'Failed to generate checklist' });
  }
};

// Save checklist linked to saved destination
exports.saveChecklist = async (req, res) => {
  const { saved_destination_id, items } = req.body;

  if (!saved_destination_id || !items) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id FROM saved_destinations WHERE id = ? AND user_id = ?',
      [saved_destination_id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM checklists WHERE saved_destination_id = ?',
      [saved_destination_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE checklists SET items = ? WHERE saved_destination_id = ?',
        [JSON.stringify(items), saved_destination_id]
      );
    } else {
      await pool.query(
        'INSERT INTO checklists (saved_destination_id, items) VALUES (?, ?)',
        [saved_destination_id, JSON.stringify(items)]
      );
    }

    res.json({ message: 'Checklist saved successfully' });
  } catch (err) {
    console.error('Save checklist error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get checklist for a saved destination
exports.getChecklist = async (req, res) => {
  const { saved_destination_id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT c.* FROM checklists c
       JOIN saved_destinations sd ON sd.id = c.saved_destination_id
       WHERE c.saved_destination_id = ? AND sd.user_id = ?`,
      [saved_destination_id, req.user.id]
    );

    if (rows.length === 0) {
      return res.json({ items: null });
    }

    const row = rows[0];
    res.json({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    });
  } catch (err) {
    console.error('Get checklist error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};