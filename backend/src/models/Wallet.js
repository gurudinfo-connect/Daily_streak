const mongoose = require('mongoose');

// Balances are stored per currency so VES (in-app points) and cash-value
// gift-card rewards are tracked independently. Extend `balances` for new
// currencies without a schema migration.
const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balances: {
      VES: { type: Number, default: 0, min: 0 },
      INR: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wallet', walletSchema);
