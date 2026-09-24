const asyncHandler = require('../utils/asyncHandler');
const streakService = require('../services/streak.service');

// req.userId comes only from the verified JWT (see auth.middleware.js).
// We deliberately never read req.body.userId anywhere in this file.

const getStreak = asyncHandler(async (req, res) => {
  const status = await streakService.getStreakStatus(req.userId, req.ip);
  res.json({ success: true, ...status });
});

const getStatus = asyncHandler(async (req, res) => {
  const status = await streakService.getStreakStatus(req.userId, req.ip);
  res.json({
    success: true,
    serverTime: status.serverTime,
    streak: status.streak,
  });
});

const claim = asyncHandler(async (req, res, next) => {
  try {
    // req.body.day (if present) is only used as an optimistic-lock hint —
    // see streak.service.js#claimReward, which re-derives the real day from
    // the user's stored cycle and rejects mismatches. reward/amount/currency/
    // streak sent by the client are never read at all.
    const requestedDay = req.body?.day;
    const status = await streakService.claimReward(req.userId, requestedDay, req.ip);
    res.json({ success: true, ...status });
  } catch (err) {
    if (err instanceof streakService.ClaimError) {
      return res.status(err.httpStatus).json({ success: false, code: err.code, message: err.message });
    }
    next(err);
  }
});

const history = asyncHandler(async (req, res) => {
  const items = await streakService.getHistory(req.userId);
  res.json({ success: true, history: items });
});

module.exports = { getStreak, getStatus, claim, history };
