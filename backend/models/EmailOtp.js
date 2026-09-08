const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    codeHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['login', 'register', 'reset'],
      required: true,
    },
    payload: { type: mongoose.Schema.Types.Mixed },
    role: { type: String, enum: ['admin', 'provider', 'beneficiary'], default: undefined },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

emailOtpSchema.index({ email: 1, purpose: 1, role: 1 });
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailOtp', emailOtpSchema);
