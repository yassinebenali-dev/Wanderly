const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  generateChecklist,
  saveChecklist,
  getChecklist,
} = require('../controllers/checklistController');

router.post('/generate', authenticateToken, generateChecklist);
router.post('/save', authenticateToken, saveChecklist);
router.get('/:saved_destination_id', authenticateToken, getChecklist);

module.exports = router;