const pool = require('../config/db');

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalSaved }]] = await pool.query('SELECT COUNT(*) as totalSaved FROM saved_destinations');
    const [[{ totalSearches }]] = await pool.query('SELECT COALESCE(SUM(search_count), 0) as totalSearches FROM destination_stats');
    const globalSaveRate = totalSearches > 0 ? Math.round((totalSaved / totalSearches) * 100) : 0;

    const [topSearched] = await pool.query(
      `SELECT destination, search_count, save_count
       FROM destination_stats
       ORDER BY search_count DESC
       LIMIT 5`
    );

    const [topSaved] = await pool.query(
      `SELECT destination, search_count, save_count
      FROM destination_stats
      WHERE save_count > 0
      ORDER BY save_count DESC
      LIMIT 5`
);

    const [recentUsers] = await pool.query(
      `SELECT id, email, display_name, role, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 5`
    );

    res.json({
      totalUsers,
      totalSaved,
      totalSearches,
      globalSaveRate,
      topSearched,
      topSaved,
      recentUsers
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, email, display_name, role, created_at FROM users ORDER BY created_at DESC`
    );
    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ? AND role != "admin"', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or cannot delete admin' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all saved destinations
exports.getSavedDestinations = async (req, res) => {
  try {
    const [saved] = await pool.query(
      `SELECT sd.id, sd.destination, sd.budget, sd.created_at,
              u.email, u.display_name
       FROM saved_destinations sd
       JOIN users u ON u.id = sd.user_id
       ORDER BY sd.created_at DESC`
    );
    res.json({ saved });
  } catch (err) {
    console.error('Get saved error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get destination stats
exports.getDestinationStats = async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT destination, search_count, save_count, last_searched
       FROM destination_stats
       ORDER BY search_count DESC`
    );
    res.json({ stats });
  } catch (err) {
    console.error('Get destination stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};