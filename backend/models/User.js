const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const roles = ['admin', 'provider', 'beneficiary'];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    organization: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String, default: '' },
    password: { type: String, minlength: 8 },
    googleId: { type: String, unique: true, sparse: true, index: true },
    role: { type: String, enum: roles, default: 'beneficiary' },
    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  // 8 rounds is still strong and much faster than 10+ on local/dev hardware.
  const salt = await bcrypt.genSalt(8);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
