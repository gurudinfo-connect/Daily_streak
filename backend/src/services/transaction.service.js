const WalletTransaction = require('../models/WalletTransaction');

async function recordTransaction({
  userId,
  currency,
  amount,
  referenceId,
  streakDay,
  balanceBefore,
  balanceAfter,
  session,
}) {
  const [tx] = await WalletTransaction.create(
    [
      {
        userId,
        currency,
        type: 'CREDIT',
        amount,
        source: 'DAILY_STREAK',
        referenceId,
        streakDay,
        balanceBefore,
        balanceAfter,
        status: 'COMPLETED',
      },
    ],
    { session }
  );
  return tx;
}

module.exports = { recordTransaction };
