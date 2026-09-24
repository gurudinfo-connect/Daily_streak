const Wallet = require('../models/Wallet');

async function getOrCreateWallet(userId) {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }
  return wallet;
}

// Atomically increments the wallet balance and returns before/after values.
// Using $inc (a MongoDB atomic operator) means two concurrent credits can
// never clobber each other the way a read-modify-write in JS could.
async function creditWallet(userId, currency, amount, session) {
  const before = await Wallet.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true, new: false, setDefaultsOnInsert: true, session }
  );
  const balanceBefore = before ? before.balances?.[currency] || 0 : 0;

  const updated = await Wallet.findOneAndUpdate(
    { userId },
    { $inc: { [`balances.${currency}`]: amount } },
    { new: true, upsert: true, session }
  );
  const balanceAfter = updated.balances?.[currency] || 0;

  return { balanceBefore, balanceAfter, wallet: updated };
}

module.exports = { getOrCreateWallet, creditWallet };
