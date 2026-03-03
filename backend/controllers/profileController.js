const pool = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.display_name, u.created_at,
              p.bio, p.avatar_url
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { display_name, bio, avatar_url } = req.body;

  try {
    await pool.query(
      'UPDATE users SET display_name = ? WHERE id = ?',
      [display_name, req.user.id]
    );

    await pool.query(
      'UPDATE profiles SET bio = ?, avatar_url = ? WHERE user_id = ?',
      [bio, avatar_url, req.user.id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};