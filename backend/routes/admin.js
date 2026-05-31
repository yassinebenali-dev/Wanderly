const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminAuth');
const {
  getStats,
  getUsers,
  deleteUser,
  getSavedDestinations,
  getDestinationStats,
  getSubscriptionStats,
} = require('../controllers/adminController');

router.get('/stats', authenticateAdmin, getStats);
router.get('/users', authenticateAdmin, getUsers);
router.delete('/users/:id', authenticateAdmin, deleteUser);
router.get('/saved', authenticateAdmin, getSavedDestinations);
router.get('/destination-stats', authenticateAdmin, getDestinationStats);
router.get('/subscription-stats', authenticateAdmin, getSubscriptionStats);

module.exports = router;