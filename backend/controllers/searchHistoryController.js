const pool = require('../config/db');

exports.getSearchHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, destination, budget, interests, searched_at 
       FROM search_history 
       WHERE user_id = ? 
       ORDER BY searched_at DESC 
       LIMIT 20`,
      [req.user.id]
    );

    const parsed = rows.map(row => ({
      ...row,
      interests: typeof row.interests === 'string' ? JSON.parse(row.interests) : row.interests,
    }));

    res.json(parsed);
  } catch (err) {
    console.error('Get search history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteSearchHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM search_history WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Delete search history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.clearSearchHistory = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM search_history WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ message: 'History cleared successfully' });
  } catch (err) {
    console.error('Clear search history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};