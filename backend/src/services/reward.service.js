const StreakReward = require('../models/StreakReward');
const StreakConfig = require('../models/StreakConfig');

async function getConfig() {
  let config = await StreakConfig.findOne({ key: 'default' });
  if (!config) {
    config = await StreakConfig.create({ key: 'default' });
  }
  return config;
}

async function getRewardForDay(day) {
  return StreakReward.findOne({ day, active: true });
}

async function getAllRewards() {
  return StreakReward.find({ active: true }).sort({ day: 1 });
}

module.exports = { getConfig, getRewardForDay, getAllRewards };
