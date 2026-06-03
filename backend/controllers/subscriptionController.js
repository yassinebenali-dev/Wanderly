const pool = require('../config/db');

// Get current period start based on plan activation date
const getPeriodStart = (startedAt) => {
  const started = new Date(startedAt);
  const now = new Date();
  
  // Calculate how many 30-day periods have passed since activation
  const diffMs = now - started;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const periodsElapsed = Math.floor(diffDays / 30);
  
  // Current period start
  const periodStart = new Date(started);
  periodStart.setDate(periodStart.getDate() + periodsElapsed * 30);
  
  return periodStart.toISOString().slice(0, 19).replace('T', ' ');
};

// Check and handle plan expiration
const checkAndHandleExpiration = async (userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT us.*, sp.name as plan_name 
       FROM user_subscriptions us
       JOIN subscription_plans sp ON sp.id = us.plan_id
       WHERE us.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) return null;

    const subscription = rows[0];

    // If plan has expiry and it's past due
    if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
      // Downgrade to Free
      const [freePlan] = await pool.query(
        'SELECT * FROM subscription_plans WHERE name = ?', ['Free']
      );

      await pool.query(
        `UPDATE user_subscriptions 
         SET plan_id = ?, started_at = NOW(), expires_at = NULL 
         WHERE user_id = ?`,
        [freePlan[0].id, userId]
      );

      console.log(`User ${userId} downgraded to Free plan (expired)`);
      return { ...freePlan[0], started_at: new Date(), expires_at: null };
    }

    return subscription;
  } catch (err) {
    console.error('Check expiration error:', err);
    return null;
  }
};

// Get user subscription (with expiration check)
exports.getUserSubscription = async (userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT us.*, sp.* , us.id as subscription_id, sp.id as plan_id,
              us.started_at, us.expires_at, sp.name as plan_name
       FROM user_subscriptions us
       JOIN subscription_plans sp ON sp.id = us.plan_id
       WHERE us.user_id = ?`,
      [userId]
    );

    // If no plan, assign Free
    if (rows.length === 0) {
      const [freePlan] = await pool.query(
        'SELECT * FROM subscription_plans WHERE name = ?', ['Free']
      );
      await pool.query(
        'INSERT INTO user_subscriptions (user_id, plan_id, expires_at) VALUES (?, ?, NULL)',
        [userId, freePlan[0].id]
      );
      return freePlan[0];
    }

    const subscription = rows[0];

    // Check expiration
    if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
      const [freePlan] = await pool.query(
        'SELECT * FROM subscription_plans WHERE name = ?', ['Free']
      );
      await pool.query(
        `UPDATE user_subscriptions 
         SET plan_id = ?, started_at = NOW(), expires_at = NULL 
         WHERE user_id = ?`,
        [freePlan[0].id, userId]
      );
      return { ...freePlan[0], started_at: new Date(), expires_at: null };
    }

    return subscription;
  } catch (err) {
    console.error('Get subscription error:', err);
    return null;
  }
};

// Get usage for current 30-day period
exports.getUsage = async (userId) => {
  try {
    // Get subscription start date
    const [subRows] = await pool.query(
      'SELECT started_at FROM user_subscriptions WHERE user_id = ?',
      [userId]
    );

    if (subRows.length === 0) {
      return { searches: 0, chat_messages: 0, itineraries: 0, checklists: 0, budgets: 0, saved: 0 };
    }

    const periodStart = getPeriodStart(subRows[0].started_at);

    // Get or create usage counter for current period
    const [rows] = await pool.query(
      'SELECT * FROM usage_counters WHERE user_id = ? AND period_start = ?',
      [userId, periodStart]
    );

    if (rows.length === 0) {
      await pool.query(
        'INSERT IGNORE INTO usage_counters (user_id, period_start) VALUES (?, ?)',
        [userId, periodStart]
      );
      return { searches: 0, chat_messages: 0, itineraries: 0, checklists: 0, budgets: 0, saved: 0 };
    }

    return rows[0];
  } catch (err) {
    console.error('Get usage error:', err);
    return { searches: 0, chat_messages: 0, itineraries: 0, checklists: 0, budgets: 0, saved: 0 };
  }
};

// Increment usage counter
exports.incrementUsage = async (userId, field) => {
  try {
    const [subRows] = await pool.query(
      'SELECT started_at FROM user_subscriptions WHERE user_id = ?',
      [userId]
    );

    if (subRows.length === 0) return;

    const periodStart = getPeriodStart(subRows[0].started_at);

    await pool.query(
      `INSERT INTO usage_counters (user_id, period_start, ${field})
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE ${field} = ${field} + 1`,
      [userId, periodStart]
    );
  } catch (err) {
    console.error('Increment usage error:', err);
  }
};

// Check if user can perform an action
exports.checkLimit = async (userId, field) => {
  try {
    const plan = await exports.getUserSubscription(userId);
    const usage = await exports.getUsage(userId);

    if (!plan || !usage) return { allowed: true };

    const limit = plan[`max_${field}`];

    // -1 means unlimited
    if (limit === -1) return { allowed: true };

    const current = usage[field] || 0;

    if (current >= limit) {
      return {
        allowed: false,
        current,
        limit,
        plan: plan.name || plan.plan_name,
        message: `You have reached your ${field.replace('_', ' ')} limit (${current}/${limit}) for this period on the ${plan.name || plan.plan_name} plan. Please upgrade to continue.`
      };
    }

    return { allowed: true, current, limit, remaining: limit - current };
  } catch (err) {
    console.error('Check limit error:', err);
    return { allowed: true };
  }
};

// Get full subscription info for frontend
exports.getSubscriptionInfo = async (req, res) => {
  try {
    const plan = await exports.getUserSubscription(req.user.id);
    const usage = await exports.getUsage(req.user.id);

    // Get expires_at from DB
    const [subRows] = await pool.query(
      'SELECT started_at, expires_at FROM user_subscriptions WHERE user_id = ?',
      [req.user.id]
    );

    const subscription = subRows[0] || {};
    const periodStart = getPeriodStart(subscription.started_at || new Date());

    // Calculate period end (30 days from period start)
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 30);

    res.json({
      plan,
      usage,
      started_at: subscription.started_at,
      expires_at: subscription.expires_at,
      period_start: periodStart,
      period_end: periodEnd.toISOString(),
    });
  } catch (err) {
    console.error('Get subscription info error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all plans
exports.getPlans = async (req, res) => {
  try {
    const [plans] = await pool.query('SELECT * FROM subscription_plans ORDER BY id');
    res.json({ plans });
  } catch (err) {
    console.error('Get plans error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Change user plan
exports.changePlan = async (req, res) => {
  const { plan_name } = req.body;

  try {
    const [plans] = await pool.query(
      'SELECT * FROM subscription_plans WHERE name = ?', [plan_name]
    );

    if (plans.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const plan = plans[0];

    // Calculate expiry: 30 days for paid plans, NULL for Free
    const expiresAt = plan_name !== 'Free'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : null;

    const [existing] = await pool.query(
      'SELECT id FROM user_subscriptions WHERE user_id = ?', [req.user.id]
    );

    if (existing.length > 0) {
  await pool.query(
    `UPDATE user_subscriptions 
     SET plan_id = ?, started_at = NOW(), expires_at = ? 
     WHERE user_id = ?`,
    [plan.id, expiresAt, req.user.id]
  );
} else {
  await pool.query(
    'INSERT INTO user_subscriptions (user_id, plan_id, started_at, expires_at) VALUES (?, ?, NOW(), ?)',
    [req.user.id, plan.id, expiresAt]
  );
}

// Record transaction only for paid plans
if (plan_name !== 'Free') {
  const amount = plan_name === 'Gold' ? 9.99 : plan_name === 'Diamond' ? 24.99 : 0;
  await pool.query(
    'INSERT INTO subscription_transactions (user_id, plan_name, amount) VALUES (?, ?, ?)',
    [req.user.id, plan_name, amount]
  );
}

    res.json({
      message: `Plan changed to ${plan_name} successfully`,
      plan,
      expires_at: expiresAt,
    });
  } catch (err) {
    console.error('Change plan error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};