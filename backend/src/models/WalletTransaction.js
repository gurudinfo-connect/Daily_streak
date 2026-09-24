const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currency: { type: String, enum: ['VES', 'INR'], required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], default: 'CREDIT' },
    amount: { type: Number, required: true },
    source: { type: String, enum: ['DAILY_STREAK'], default: 'DAILY_STREAK' },
    referenceId: { type: String, required: true, unique: true }, // e.g. STREAK-<claimId>
    streakDay: { type: Number },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    status: { type: String, enum: ['COMPLETED'], default: 'COMPLETED' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
