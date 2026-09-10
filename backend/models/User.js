const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['admin', 'provider', 'beneficiary'];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    organization: { type: String },
    email: { type: String, required: true, lowercase: true },
    phoneNumber: { type: String, default: '' },
    password: {
      type: String,
      minlength: 8,
      required() {
        return !this.googleId;
      },
    },
    googleId: { type: String, sparse: true },
    role: { type: String, enum: ROLES, default: 'beneficiary' },
    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, role: 1 }, { unique: true });
userSchema.index({ googleId: 1, role: 1 }, { unique: true, sparse: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.password || !this.isModified('password')) {
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

userSchema.statics.ensureEmailRoleIndex = async function ensureEmailRoleIndex() {
  try {
    await this.collection.dropIndex('email_1');
    console.log('[users] Same email can now be used for a mobile account and a provider account');
  } catch (error) {
    if (error.code !== 27 && error.codeName !== 'IndexNotFound') {
      console.warn('[users] Could not drop email_1 index:', error.message);
    }
  }
  try {
    await this.collection.dropIndex('googleId_1');
    console.log('[users] Same Google account can now be used across mobile, provider, and admin roles');
  } catch (error) {
    if (error.code !== 27 && error.codeName !== 'IndexNotFound') {
      console.warn('[users] Could not drop googleId_1 index:', error.message);
    }
  }
  await this.syncIndexes();
};

const User = mongoose.model('User', userSchema);
User.ROLES = ROLES;

module.exports = User;
