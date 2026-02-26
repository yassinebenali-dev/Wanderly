const pool = require('../config/db');

exports.saveDestination = async (req, res) => {
  const { destination, budget, interests, recommendations } = req.body;

  if (!destination || !recommendations) {
    return res.status(400).json({ error: 'Destination and recommendations are required' });
  }

  try {
    // Check if already saved
    const [existing] = await pool.query(
      'SELECT id FROM saved_destinations WHERE user_id = ? AND destination = ?',
      [req.user.id, destination]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Destination already saved' });
    }

    const [result] = await pool.query(
      'INSERT INTO saved_destinations (user_id, destination, budget, interests, recommendations) VALUES (?, ?, ?, ?, ?)',
      [
        req.user.id,
        destination,
        budget || null,
        JSON.stringify(interests || []),
        JSON.stringify(recommendations),
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Destination saved successfully' });
  } catch (err) {
    console.error('Save destination error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSavedDestinations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, destination, budget, interests, recommendations, created_at FROM saved_destinations WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const parsed = rows.map(row => ({
      ...row,
      interests: typeof row.interests === 'string' ? JSON.parse(row.interests) : row.interests,
      recommendations: typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : row.recommendations,
    }));

    res.json(parsed);
  } catch (err) {
    console.error('Get saved destinations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteDestination = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM saved_destinations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Saved destination not found' });
    }

    res.json({ message: 'Destination removed successfully' });
  } catch (err) {
    console.error('Delete destination error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.checkSaved = async (req, res) => {
  const { destination } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT id FROM saved_destinations WHERE user_id = ? AND destination = ?',
      [req.user.id, destination]
    );

    res.json({ saved: rows.length > 0, id: rows[0]?.id || null });
  } catch (err) {
    console.error('Check saved error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};