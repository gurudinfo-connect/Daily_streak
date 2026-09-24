const mongoose = require('mongoose');
const StreakCycle = require('../models/StreakCycle');
const StreakClaim = require('../models/StreakClaim');
const AuditLog = require('../models/AuditLog');
const rewardService = require('./reward.service');
const walletService = require('./wallet.service');
const transactionService = require('./transaction.service');

const MS_PER_HOUR = 60 * 60 * 1000;

class ClaimError extends Error {
  constructor(code, message, httpStatus = 400) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

async function log(userId, event, details = {}, ip) {
  try {
    await AuditLog.create({ userId, event, details, ip });
  } catch (e) {
    // Auditing must never block the main flow.
    console.error('[audit] failed to write log', e.message);
  }
}

// Every count of cycles a user has ever had, used for cycleNumber.
async function countCyclesForUser(userId) {
  return StreakCycle.countDocuments({ userId });
}

async function startNewCycle(userId) {
  const cycleNumber = (await countCyclesForUser(userId)) + 1;
  const cycle = await StreakCycle.create({
    userId,
    cycleNumber,
    status: 'ACTIVE',
    currentDay: 1,
    checkedIn: 0,
    lastClaimAt: null,
    nextClaimAt: null, // Day 1 is immediately claimable
    startedAt: new Date(),
  });
  return cycle;
}

async function getActiveCycle(userId) {
  let cycle = await StreakCycle.findOne({ userId, status: 'ACTIVE' }).sort({ createdAt: -1 });
  if (!cycle) {
    cycle = await startNewCycle(userId);
  }
  return cycle;
}

// The single source of truth for "has this user missed their window?"
// A user is considered to have missed the streak once (nextClaimAt + graceHours)
// has passed and they still haven't claimed the day that was waiting for them.
function hasMissedWindow(cycle, config, now) {
  if (!cycle.nextClaimAt) return false; // nothing pending (Day 1, brand-new cycle)
  const deadline = new Date(cycle.nextClaimAt.getTime() + config.graceHours * MS_PER_HOUR);
  return now.getTime() > deadline.getTime() && cycle.checkedIn < config.cycleLengthDays;
}

// Resolves the user's true current cycle, resetting it server-side if the
// claim window + grace period has elapsed without a claim. Never trusts
// anything the client says about streak/day.
async function resolveCycle(userId, ip) {
  const config = await rewardService.getConfig();
  let cycle = await getActiveCycle(userId);
  const now = new Date();

  if (hasMissedWindow(cycle, config, now)) {
    cycle.status = 'RESET';
    cycle.endedAt = now;
    await cycle.save();
    await log(userId, 'STREAK_RESET', { previousCycleId: cycle._id, previousDay: cycle.currentDay }, ip);
    cycle = await startNewCycle(userId);
  }

  return { cycle, config, now };
}

async function getStreakStatus(userId, ip) {
  const { cycle, config, now } = await resolveCycle(userId, ip);
  const rewards = await rewardService.getAllRewards();
  const claims = await StreakClaim.find({ userId, cycleId: cycle._id }).lean();
  const claimedDays = new Set(claims.map((c) => c.day));

  const rewardCards = rewards.map((r) => {
    let status;
    if (claimedDays.has(r.day)) {
      status = 'CLAIMED';
    } else if (r.day === cycle.currentDay) {
      // Today's actionable day: available only if the wait period (nextClaimAt) has elapsed
      status = !cycle.nextClaimAt || now >= cycle.nextClaimAt ? 'AVAILABLE' : 'TODAY';
    } else if (r.day < cycle.currentDay) {
      // Shouldn't normally happen (would already be CLAIMED), but guard anyway
      status = 'MISSED';
    } else {
      status = 'LOCKED';
    }

    return {
      day: r.day,
      status,
      isUltimate: r.isUltimate,
      reward: {
        type: r.rewardType,
        currency: r.currency,
        amount: r.amount,
        title: r.title,
        subtitle: r.subtitle,
        assetType: r.assetType,
      },
      nextClaimAt: r.day === cycle.currentDay ? cycle.nextClaimAt : r.day > cycle.currentDay ? cycle.nextClaimAt : null,
    };
  });

  const nextRewardDoc = rewards.find((r) => r.day === cycle.currentDay);
  const wallet = await walletService.getOrCreateWallet(userId);

  return {
    serverTime: now.toISOString(),
    streak: {
      currentStreak: cycle.checkedIn,
      currentDay: cycle.currentDay,
      checkedIn: cycle.checkedIn,
      totalRewards: rewards.length,
      status: cycle.status,
      cycleNumber: cycle.cycleNumber,
      nextClaimAt: cycle.nextClaimAt,
      claimableNow: !cycle.nextClaimAt || now >= cycle.nextClaimAt,
    },
    nextReward: nextRewardDoc
      ? { day: nextRewardDoc.day, amount: nextRewardDoc.amount, currency: nextRewardDoc.currency, type: nextRewardDoc.rewardType }
      : null,
    wallet: wallet.balances,
    rewards: rewardCards,
  };
}

// The one function that actually moves money. Everything the client sends
// (day, reward, amount, streak, userId) is either ignored or used only as
// a hint — the backend independently re-derives every fact before granting
// anything.
async function claimReward(userId, requestedDay, ip) {
  await log(userId, 'STREAK_CLAIM_REQUEST', { requestedDay }, ip);

  const { cycle, config, now } = await resolveCycle(userId, ip);

  // 1. Current day correctness — client-provided day is never authoritative,
  //    it's only checked for a friendly error message.
  const actualDay = cycle.currentDay;
  if (requestedDay !== undefined && requestedDay !== null && Number(requestedDay) !== actualDay) {
    await log(userId, 'STREAK_CLAIM_REJECTED', { reason: 'DAY_MISMATCH', requestedDay, actualDay }, ip);
    throw new ClaimError('DAY_MISMATCH', 'Your streak has moved on — refresh to see your real current day.', 409);
  }

  // 2. Waiting period completed?
  if (cycle.nextClaimAt && now < cycle.nextClaimAt) {
    await log(userId, 'STREAK_CLAIM_REJECTED', { reason: 'STILL_LOCKED', nextClaimAt: cycle.nextClaimAt }, ip);
    throw new ClaimError('STILL_LOCKED', 'Your next reward is not available yet.', 409);
  }

  // 3. Reward must exist and be active for this day
  const reward = await rewardService.getRewardForDay(actualDay);
  if (!reward) {
    throw new ClaimError('NO_REWARD_CONFIGURED', 'Unable to process your reward. Please try again.', 500);
  }

  // 4. Attempt the claim inside a transaction so the claim record, wallet
  //    credit, transaction ledger entry and cycle advance are all-or-nothing.
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      // The unique index on (userId, cycleId, day) is the real duplicate/
      // concurrency guard: if two requests race, the second insert throws
      // E11000 and is caught below — only one can ever succeed.
      const [claim] = await StreakClaim.create(
        [{ userId, cycleId: cycle._id, day: actualDay, rewardId: reward._id, status: 'SUCCESS', claimedAt: now }],
        { session }
      );

      const { balanceBefore, balanceAfter } = await walletService.creditWallet(
        userId,
        reward.currency,
        reward.amount,
        session
      );

      const tx = await transactionService.recordTransaction({
        userId,
        currency: reward.currency,
        amount: reward.amount,
        referenceId: `STREAK-${claim._id}`,
        streakDay: actualDay,
        balanceBefore,
        balanceAfter,
        session,
      });

      claim.transactionId = tx._id;
      await claim.save({ session });

      const isLastDay = actualDay >= config.cycleLengthDays;
      cycle.checkedIn += 1;
      cycle.lastClaimAt = now;

      if (isLastDay) {
        cycle.status = 'COMPLETED';
        cycle.endedAt = now;
        await cycle.save({ session });
      } else {
        cycle.currentDay = actualDay + 1;
        cycle.nextClaimAt = new Date(now.getTime() + config.claimWindowHours * MS_PER_HOUR);
        await cycle.save({ session });
      }

      result = { claim, tx, isLastDay, reward };
    });
  } catch (err) {
    await session.endSession();
    if (err && err.code === 11000) {
      await log(userId, 'DUPLICATE_CLAIM', { day: actualDay }, ip);
      throw new ClaimError('ALREADY_CLAIMED', 'This reward has already been claimed.', 409);
    }
    throw err;
  }
  await session.endSession();

  await log(userId, 'STREAK_CLAIM_SUCCESS', { day: actualDay, reward: reward.amount, currency: reward.currency }, ip);

  // If the cycle just completed, immediately start the next one so the
  // status endpoint has something sane to return (Day 1, fresh cycle).
  if (result.isLastDay) {
    await startNewCycle(userId);
  }

  return getStreakStatus(userId, ip);
}

async function getHistory(userId) {
  const claims = await StreakClaim.find({ userId })
    .sort({ claimedAt: -1 })
    .populate('rewardId', 'day rewardType currency amount title')
    .lean();
  return claims.map((c) => ({
    day: c.day,
    claimedAt: c.claimedAt,
    reward: c.rewardId,
    transactionId: c.transactionId,
  }));
}

module.exports = { getStreakStatus, claimReward, getHistory, ClaimError };
