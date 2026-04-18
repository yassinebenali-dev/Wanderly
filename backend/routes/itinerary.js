const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  generateItinerary,
  saveItinerary,
  getItinerary,
} = require('../controllers/itineraryController');

router.post('/generate', authenticateToken, generateItinerary);
router.post('/save', authenticateToken, saveItinerary);
router.get('/:saved_destination_id', authenticateToken, getItinerary);

module.exports = router;