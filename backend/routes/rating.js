const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  submitRating,
  getRatings,
  getUserRating,
  deleteRating,
} = require('../controllers/ratingController');

router.post('/', authenticateToken, submitRating);
router.get('/:destination', getRatings);
router.get('/user/:destination', authenticateToken, getUserRating);
router.delete('/:destination', authenticateToken, deleteRating);

module.exports = router;