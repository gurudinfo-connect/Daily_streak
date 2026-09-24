const mongoose = require('mongoose');

const streakClaimSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'StreakCycle', required: true },
    day: { type: Number, required: true },
    rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'StreakReward', required: true },
    status: { type: String, enum: ['SUCCESS'], default: 'SUCCESS' },
    claimedAt: { type: Date, default: Date.now },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction' },
  },
  { timestamps: true }
);

// The core anti-duplicate-claim guarantee: the database itself rejects a
// second claim for the same user+cycle+day, even under concurrent requests.
streakClaimSchema.index({ userId: 1, cycleId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('StreakClaim', streakClaimSchema);
