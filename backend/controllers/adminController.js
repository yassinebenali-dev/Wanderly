const pool = require('../config/db');

const PLAN_PRICES = {
  'Free': 0,
  'Gold': 9.99,
  'Diamond': 24.99,
};

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalSaved }]] = await pool.query('SELECT COUNT(*) as totalSaved FROM saved_destinations');
    const [[{ totalSearches }]] = await pool.query('SELECT COALESCE(SUM(search_count), 0) as totalSearches FROM destination_stats');
    const globalSaveRate = totalSearches > 0 ? Math.round((totalSaved / totalSearches) * 100) : 0;

    const [topSearched] = await pool.query(
      `SELECT destination, search_count, save_count
       FROM destination_stats ORDER BY search_count DESC LIMIT 5`
    );

    const [topSaved] = await pool.query(
      `SELECT destination, search_count, save_count
       FROM destination_stats WHERE save_count > 0 ORDER BY save_count DESC LIMIT 5`
    );

    const [recentUsers] = await pool.query(
      `SELECT id, email, display_name, role, created_at
       FROM users ORDER BY created_at DESC LIMIT 5`
    );

    res.json({ totalUsers, totalSaved, totalSearches, globalSaveRate, topSearched, topSaved, recentUsers });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get subscription stats
exports.getSubscriptionStats = async (req, res) => {
  try {
    // Plan distribution — ALL users with their current plan (default Free)
    const [planDistribution] = await pool.query(
      `SELECT plan_name, count FROM (
        SELECT 
          COALESCE(sp.name, 'Free') as plan_name,
          COUNT(u.id) as count
        FROM users u
        LEFT JOIN user_subscriptions us ON us.user_id = u.id
        LEFT JOIN subscription_plans sp ON sp.id = us.plan_id
        GROUP BY plan_name
      ) AS sub
      ORDER BY CASE plan_name
        WHEN 'Free' THEN 1
        WHEN 'Gold' THEN 2
        WHEN 'Diamond' THEN 3
        ELSE 1
      END`
    );

    // Total paying subscribers (Gold + Diamond) — active only
    const [[{ totalPaying }]] = await pool.query(
      `SELECT COUNT(us.id) as totalPaying
       FROM user_subscriptions us
       JOIN subscription_plans sp ON sp.id = us.plan_id
       WHERE sp.name != 'Free' AND (us.expires_at IS NULL OR us.expires_at > NOW())`
    );

    // Total users for conversion rate
    const [[{ totalUsers }]] = await pool.query(
      'SELECT COUNT(*) as totalUsers FROM users'
    );

    // Monthly revenue — from transactions this month
    const [[{ monthlyRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as monthlyRevenue
       FROM subscription_transactions
       WHERE YEAR(created_at) = YEAR(NOW())
       AND MONTH(created_at) = MONTH(NOW())`
    );

    // Yearly revenue — from transactions this year
    const [[{ yearlyRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as yearlyRevenue
       FROM subscription_transactions
       WHERE YEAR(created_at) = YEAR(NOW())`
    );

    // All-time revenue — from all transactions ever
    const [[{ allTimeRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as allTimeRevenue
       FROM subscription_transactions`
    );

    // Recent upgrades — from transactions
    const [recentUpgrades] = await pool.query(
      `SELECT u.email, u.display_name, st.plan_name, st.created_at as started_at,
              us.expires_at
       FROM subscription_transactions st
       JOIN users u ON u.id = st.user_id
       LEFT JOIN user_subscriptions us ON us.user_id = st.user_id
       ORDER BY st.created_at DESC
       LIMIT 10`
    );

    // Revenue per month (last 6 months) — from transactions
    const [monthlyUpgrades] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month,
              COUNT(*) as upgrades,
              SUM(amount) as revenue
       FROM subscription_transactions
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    // Expiring soon (next 7 days)
    const [[{ expiringSoon }]] = await pool.query(
      `SELECT COUNT(*) as expiringSoon FROM user_subscriptions
       WHERE expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)`
    );

    res.json({
      planDistribution,
      totalPaying,
      totalUsers,
      monthlyRevenue: parseFloat(parseFloat(monthlyRevenue).toFixed(2)),
      yearlyRevenue: parseFloat(parseFloat(yearlyRevenue).toFixed(2)),
      allTimeRevenue: parseFloat(parseFloat(allTimeRevenue).toFixed(2)),
      recentUpgrades,
      monthlyUpgrades,
      expiringSoon,
    });
  } catch (err) {
    console.error('Subscription stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.email, u.display_name, u.role, u.created_at,
              sp.name as plan_name
       FROM users u
       LEFT JOIN user_subscriptions us ON us.user_id = u.id
       LEFT JOIN subscription_plans sp ON sp.id = us.plan_id
       ORDER BY u.created_at DESC`
    );
    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ? AND role != "admin"', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or cannot delete admin' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all saved destinations
exports.getSavedDestinations = async (req, res) => {
  try {
    const [saved] = await pool.query(
      `SELECT sd.id, sd.destination, sd.budget, sd.created_at,
              u.email, u.display_name
       FROM saved_destinations sd
       JOIN users u ON u.id = sd.user_id
       ORDER BY sd.created_at DESC`
    );
    res.json({ saved });
  } catch (err) {
    console.error('Get saved error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get destination stats
exports.getDestinationStats = async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT destination, search_count, save_count, last_searched
       FROM destination_stats ORDER BY search_count DESC`
    );
    res.json({ stats });
  } catch (err) {
    console.error('Get destination stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};