const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const recommendationsRoutes = require('./routes/recommendations');
const savedRoutes = require('./routes/saved');
const adminRoutes = require('./routes/admin');
const searchHistoryRoutes = require('./routes/searchHistory');
const itineraryRoutes = require('./routes/itinerary');
const checklistRoutes = require('./routes/checklist');
const budgetRoutes = require('./routes/budget');
const ratingRoutes = require('./routes/rating');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search-history', searchHistoryRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Wanderly backend is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Wanderly backend running on http://localhost:${PORT}`);
});