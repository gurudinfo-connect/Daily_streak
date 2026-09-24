const express = require('express');
const rateLimit = require('express-rate-limit');
const { getStreak, getStatus, claim, history } = require('../controllers/streak.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Basic abuse protection on top of the backend's own idempotency/concurrency
// guarantees — this limits brute-force claim hammering per IP.
const claimLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
});

router.use(requireAuth);

router.get('/', getStreak);
router.get('/status', getStatus);
router.get('/history', history);
router.post('/claim', claimLimiter, claim);

module.exports = router;
