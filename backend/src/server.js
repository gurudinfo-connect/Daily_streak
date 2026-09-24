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
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5174',
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (req, res) => res.json({ success: true, message: 'VELoop Daily Streak API is running.' }));

app.use('/api/auth', authRoutes);
app.use('/api/daily-streak', streakRoutes);

app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB before handling API requests.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[server] database connection failed:', err.message);
    next(err);
  }
});

// Export the Express app for Vercel.
module.exports = app;

// Start a local server only when running this file directly.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`[server] listening on port ${PORT}`);
  });
}
