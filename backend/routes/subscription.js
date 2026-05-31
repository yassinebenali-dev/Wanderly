const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getSubscriptionInfo,
  getPlans,
  changePlan,
} = require('../controllers/subscriptionController');

router.get('/info', authenticateToken, getSubscriptionInfo);
router.get('/plans', getPlans);
router.post('/change', authenticateToken, changePlan);

module.exports = router;