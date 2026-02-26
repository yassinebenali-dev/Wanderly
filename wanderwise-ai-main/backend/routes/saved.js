const express = require('express');
const router = express.Router();
const {
  saveDestination,
  getSavedDestinations,
  deleteDestination,
  checkSaved,
} = require('../controllers/savedController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, saveDestination);
router.get('/', authMiddleware, getSavedDestinations);
router.delete('/:id', authMiddleware, deleteDestination);
router.get('/check/:destination', authMiddleware, checkSaved);

module.exports = router;