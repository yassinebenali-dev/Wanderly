const pool = require('../config/db');

exports.saveBudget = async (req, res) => {
  const { saved_destination_id, total_budget, categories } = req.body;

  if (!saved_destination_id || !total_budget || !categories) {
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
      'SELECT id FROM budgets WHERE saved_destination_id = ?',
      [saved_destination_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE budgets SET total_budget = ?, categories = ? WHERE saved_destination_id = ?',
        [total_budget, JSON.stringify(categories), saved_destination_id]
      );
    } else {
      await pool.query(
        'INSERT INTO budgets (saved_destination_id, total_budget, categories) VALUES (?, ?, ?)',
        [saved_destination_id, total_budget, JSON.stringify(categories)]
      );
    }

    res.json({ message: 'Budget saved successfully' });
  } catch (err) {
    console.error('Save budget error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getBudget = async (req, res) => {
  const { saved_destination_id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT b.* FROM budgets b
       JOIN saved_destinations sd ON sd.id = b.saved_destination_id
       WHERE b.saved_destination_id = ? AND sd.user_id = ?`,
      [saved_destination_id, req.user.id]
    );

    if (rows.length === 0) {
      return res.json({ budget: null });
    }

    const row = rows[0];
    res.json({
      ...row,
      categories: typeof row.categories === 'string' ? JSON.parse(row.categories) : row.categories,
    });
  } catch (err) {
    console.error('Get budget error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};