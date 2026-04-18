const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getSearchHistory,
  deleteSearchHistory,
  clearSearchHistory,
} = require('../controllers/searchHistoryController');

router.get('/', authenticateToken, getSearchHistory);
router.delete('/:id', authenticateToken, deleteSearchHistory);
router.delete('/', authenticateToken, clearSearchHistory);

module.exports = router;