const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const chatRoutes = require('./routes/chat');
const recommendationsRoutes = require('./routes/recommendations');
const savedRoutes = require('./routes/saved');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/saved', savedRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Wanderly backend is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Wanderly backend running on http://localhost:${PORT}`);
});