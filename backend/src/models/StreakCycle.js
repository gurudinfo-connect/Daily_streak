const mongoose = require('mongoose');

// One document per user per streak attempt. A new cycle starts on
// signup and again whenever a streak resets or completes.
const streakCycleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cycleNumber: { type: Number, required: true },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'RESET'], default: 'ACTIVE' },
    currentDay: { type: Number, default: 1 }, // the day the user is eligible to claim next
    checkedIn: { type: Number, default: 0 }, // days successfully claimed in this cycle
    lastClaimAt: { type: Date, default: null },
    nextClaimAt: { type: Date, default: null }, // null/undefined => claimable now (Day 1 or already unlocked)
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

streakCycleSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('StreakCycle', streakCycleSchema);
