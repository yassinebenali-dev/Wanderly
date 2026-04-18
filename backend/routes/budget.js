const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { saveBudget, getBudget } = require('../controllers/budgetController');

router.post('/save', authenticateToken, saveBudget);
router.get('/:saved_destination_id', authenticateToken, getBudget);

module.exports = router;