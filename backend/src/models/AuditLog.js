const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event: {
      type: String,
      enum: [
        'STREAK_CLAIM_REQUEST',
        'STREAK_CLAIM_SUCCESS',
        'STREAK_CLAIM_REJECTED',
        'STREAK_RESET',
        'DUPLICATE_CLAIM',
        'INVALID_CLAIM',
      ],
      required: true,
    },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
