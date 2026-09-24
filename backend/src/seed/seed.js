require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const StreakReward = require('../models/StreakReward');
const StreakConfig = require('../models/StreakConfig');

// Matches the reward table from the VELoop design (section 19 of the brief).
const REWARDS = [
  { day: 1, rewardType: 'VES', currency: 'VES', amount: 5, title: 'Daily Reward', assetType: 'coin' },
  { day: 2, rewardType: 'VES', currency: 'VES', amount: 10, title: 'Daily Reward', assetType: 'coin' },
  { day: 3, rewardType: 'VES', currency: 'VES', amount: 15, title: 'Daily Reward', assetType: 'coin' },
  { day: 4, rewardType: 'GIFT_CARD', currency: 'INR', amount: 1, title: 'Daily Reward', subtitle: 'Amazon Gift Card', assetType: 'gift-card' },
  { day: 5, rewardType: 'GIFT_CARD', currency: 'INR', amount: 2, title: 'Daily Reward', subtitle: 'Amazon Gift Card', assetType: 'gift-card' },
  { day: 6, rewardType: 'VES', currency: 'VES', amount: 30, title: 'Daily Reward', assetType: 'coin' },
  { day: 7, rewardType: 'GIFT_CARD', currency: 'INR', amount: 5, title: 'Ultimate Reward', subtitle: 'Amazon Gift Card', assetType: 'crown', isUltimate: true },
];

async function run() {
  await connectDB();

  await StreakConfig.findOneAndUpdate(
    { key: 'default' },
    { key: 'default', cycleLengthDays: 7, claimWindowHours: 24, graceHours: 24, active: true },
    { upsert: true }
  );

  for (const r of REWARDS) {
    await StreakReward.findOneAndUpdate({ day: r.day }, r, { upsert: true, setDefaultsOnInsert: true });
  }

  console.log('[seed] StreakConfig + 7 StreakReward days seeded.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
