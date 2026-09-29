const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const StreakCycle = require('../models/StreakCycle');
const StreakClaim = require('../models/StreakClaim');
const rewardService = require('../services/reward.service');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Read-only summary for the user dashboard. Everything is derived from the
// verified JWT user (req.userId) and from data the streak flow already writes
// (wallets, wallet transactions, cycles, claims) — nothing here changes it.
const getDashboard = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.userId);
  const since = new Date(Date.now() - 8 * MS_PER_DAY);

  const [user, wallet, config, earned, cycles, claimCount, recent, last7] = await Promise.all([
    User.findById(userId).select('email name createdAt').lean(),
    Wallet.findOne({ userId }).lean(),
    rewardService.getConfig(),
    WalletTransaction.aggregate([
      { $match: { userId, type: 'CREDIT' } },
      { $group: { _id: '$currency', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    StreakCycle.find({ userId }).select('status checkedIn currentDay nextClaimAt cycleNumber').lean(),
    StreakClaim.countDocuments({ userId }),
    WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('currency amount streakDay balanceAfter createdAt')
      .lean(),
    WalletTransaction.find({ userId, type: 'CREDIT', createdAt: { $gte: since } })
      .sort({ createdAt: 1 })
      .select('currency amount createdAt')
      .lean(),
  ]);

  const earnings = { VES: { total: 0, count: 0 }, INR: { total: 0, count: 0 } };
  earned.forEach((e) => {
    earnings[e._id] = { total: e.total, count: e.count };
  });

  const active = cycles.find((c) => c.status === 'ACTIVE');

  res.json({
    success: true,
    user: { id: user._id, email: user.email, name: user.name, memberSince: user.createdAt },
    wallet: { VES: wallet?.balances?.VES || 0, INR: wallet?.balances?.INR || 0 },
    earnings,
    streak: {
      currentStreak: active ? active.checkedIn : 0,
      currentDay: active ? active.currentDay : 1,
      cycleLength: config.cycleLengthDays,
      longestStreak: cycles.reduce((max, c) => Math.max(max, c.checkedIn), 0),
      totalCheckIns: claimCount,
      cyclesCompleted: cycles.filter((c) => c.status === 'COMPLETED').length,
      streaksLost: cycles.filter((c) => c.status === 'RESET').length,
      nextClaimAt: active ? active.nextClaimAt : null,
    },
    recent: recent.map((t) => ({
      id: t._id,
      currency: t.currency,
      amount: t.amount,
      day: t.streakDay,
      balanceAfter: t.balanceAfter,
      at: t.createdAt,
    })),
    last7Days: last7.map((t) => ({ currency: t.currency, amount: t.amount, at: t.createdAt })),
  });
});

module.exports = { getDashboard };
