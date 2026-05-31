const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const authenticateToken = require('../middleware/auth');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authenticateToken(req, res, next);
  } else {
    next();
  }
};

router.post('/', optionalAuth, chat);

module.exports = router;