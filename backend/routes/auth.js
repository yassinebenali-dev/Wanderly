const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const pool = require('../config/db');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);

router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, display_name, role FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;