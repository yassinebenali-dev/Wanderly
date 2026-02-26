const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationsController');

router.post('/', getRecommendations);

module.exports = router;