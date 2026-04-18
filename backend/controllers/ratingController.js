const pool = require('../config/db');

exports.submitRating = async (req, res) => {
  const { destination, rating, comment } = req.body;

  if (!destination || !rating) {
    return res.status(400).json({ error: 'Destination and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND destination = ?',
      [req.user.id, destination]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE ratings SET rating = ?, comment = ? WHERE user_id = ? AND destination = ?',
        [rating, comment || null, req.user.id, destination]
      );
    } else {
      await pool.query(
        'INSERT INTO ratings (user_id, destination, rating, comment) VALUES (?, ?, ?, ?)',
        [req.user.id, destination, rating, comment || null]
      );
    }

    res.json({ message: 'Rating submitted successfully' });
  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRatings = async (req, res) => {
  const { destination } = req.params;

  try {
    const [ratings] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.display_name, u.email
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.destination = ?
       ORDER BY r.created_at DESC`,
      [destination]
    );

    const [[{ avg_rating, total }]] = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total
       FROM ratings WHERE destination = ?`,
      [destination]
    );

    res.json({
      ratings,
      avg_rating: avg_rating ? parseFloat(avg_rating).toFixed(1) : null,
      total: parseInt(total),
    });
  } catch (err) {
    console.error('Get ratings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserRating = async (req, res) => {
  const { destination } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT id, rating, comment FROM ratings WHERE user_id = ? AND destination = ?',
      [req.user.id, destination]
    );

    res.json({ userRating: rows[0] || null });
  } catch (err) {
    console.error('Get user rating error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteRating = async (req, res) => {
  const { destination } = req.params;

  try {
    await pool.query(
      'DELETE FROM ratings WHERE user_id = ? AND destination = ?',
      [req.user.id, destination]
    );
    res.json({ message: 'Rating deleted successfully' });
  } catch (err) {
    console.error('Delete rating error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};