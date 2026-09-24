const mongoose = require('mongoose');

// Singleton-style platform configuration. Lets the team change cycle
// length / claim window without redeploying frontend code.
const streakConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    cycleLengthDays: { type: Number, default: 7 },
    claimWindowHours: { type: Number, default: 24 }, // how long a user has, once a day unlocks, to claim it
    graceHours: { type: Number, default: 24 }, // extra hours after the window before the streak is considered missed
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StreakConfig', streakConfigSchema);
