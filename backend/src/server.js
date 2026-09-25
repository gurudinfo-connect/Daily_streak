require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const streakRoutes = require('./routes/streak.routes');

const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// Connect MongoDB BEFORE API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[server] database connection failed:', err.message);
    next(err);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'VELoop Daily Streak API is running.'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/daily-streak', streakRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

// Local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`[server] listening on port ${PORT}`);
  });
}