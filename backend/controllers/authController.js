const crypto = require('crypto');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailOtp = require('../models/EmailOtp');
const ProviderProfile = require('../models/ProviderProfile');
const { sendOtpEmailBackground } = require('../utils/emailService');
const { deleteUploadedFile } = require('../middleware/uploadMiddleware');

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '12h' });

const generateResetToken = (userId, email) =>
  jwt.sign(
    { id: userId, email, purpose: 'reset' },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );

const toUserResponse = (user) => ({
  id: user._id,
  role: user.role,
  status: user.status,
  fullName: user.fullName,
  organization: user.organization,
  email: user.email,
  phoneNumber: user.phoneNumber,
  emailVerified: Boolean(user.emailVerified),
  createdAt: user.createdAt,
});

const hashOtp = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');

const createOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const respondMailError = (res, error, fallbackMessage) => {
  if (error.code === 'EMAIL_NOT_CONFIGURED') {
    return res.status(503).json({ message: error.message });
  }

  const msg = String(error.message || '');
  if (/Invalid login|BadCredentials|Username and Password not accepted/i.test(msg)) {
    return res.status(503).json({
      message:
        'Email service login failed. Set a valid Gmail App Password in backend/.env and restart the server.',
    });
  }

  return res.status(500).json({ message: fallbackMessage });
};

const issueOtp = async ({ email, purpose, payload }) => {
  const code = createOtpCode();
  const normalizedEmail = email.trim().toLowerCase();

  await EmailOtp.deleteMany({ email: normalizedEmail, purpose });
  await EmailOtp.create({
    email: normalizedEmail,
    codeHash: hashOtp(code),
    purpose,
    payload,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  // Do not block the HTTP response on Gmail SMTP (often 2–5s).
  sendOtpEmailBackground({ to: normalizedEmail, code, purpose });
  return { email: normalizedEmail, expiresInMinutes: 10 };
};

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, organization, email, phoneNumber, password, role = 'beneficiary' } = req.body;

  if (role === 'admin') {
    return res.status(403).json({ message: 'Direct admin registration not permitted' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (
        (role === 'beneficiary' || role === 'provider') &&
        existingUser.role === role &&
        !existingUser.emailVerified
      ) {
        await issueOtp({
          email: normalizedEmail,
          purpose: 'register',
          payload: { userId: existingUser._id.toString() },
        });
        return res.status(200).json({
          requiresOtp: true,
          purpose: 'register',
          email: normalizedEmail,
          message: 'Account pending verification. A new code was sent to your email.',
        });
      }
      return res.status(409).json({ message: 'Account already exists for this email' });
    }

    // Beneficiaries and providers must verify email OTP before account access.
    if (role === 'beneficiary' || role === 'provider') {
      const user = await User.create({
        fullName,
        organization,
        email: normalizedEmail,
        phoneNumber,
        password,
        role,
        status: 'pending',
        emailVerified: false,
      });

      try {
        await issueOtp({
          email: normalizedEmail,
          purpose: 'register',
          payload: { userId: user._id.toString() },
        });
      } catch (otpError) {
        await user.deleteOne();
        throw otpError;
      }

      return res.status(200).json({
        requiresOtp: true,
        purpose: 'register',
        email: normalizedEmail,
        message: 'Verification code sent to your email',
      });
    }

    return res.status(400).json({ message: 'Invalid registration role' });
  } catch (error) {
    console.error('Register error:', error.message);
    return respondMailError(res, error, 'Unable to create account');
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended. Contact support.' });
    }

    // All roles (admin, provider, beneficiary) require email OTP after password check.
    await issueOtp({
      email: normalizedEmail,
      purpose: 'login',
      payload: { userId: user._id.toString() },
    });

    return res.json({
      requiresOtp: true,
      purpose: 'login',
      email: normalizedEmail,
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return respondMailError(res, error, 'Unable to login');
  }
};

const verifyOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const email = String(req.body.email || '').trim().toLowerCase();
  const code = String(req.body.code || '').trim();
  const purpose = req.body.purpose;

  try {
    const otpDoc = await EmailOtp.findOne({ email, purpose }).sort({ createdAt: -1 });
    if (!otpDoc) {
      console.warn(`Verify OTP: no code for email=${email} purpose=${purpose}`);
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    if (otpDoc.expiresAt.getTime() < Date.now()) {
      await otpDoc.deleteOne();
      return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
    }

    if (otpDoc.attempts >= MAX_ATTEMPTS) {
      await otpDoc.deleteOne();
      return res.status(429).json({ message: 'Too many invalid attempts. Request a new code.' });
    }

    if (otpDoc.codeHash !== hashOtp(code)) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: 'Incorrect verification code' });
    }

    // Password reset: validate OTP, then return a short-lived reset token (do not log the user in).
    if (purpose === 'reset') {
      let user = await User.findById(otpDoc.payload?.userId);
      if (!user) {
        user = await User.findOne({ email });
      }
      if (!user) {
        await otpDoc.deleteOne();
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Account suspended. Contact support.' });
      }

      await EmailOtp.deleteMany({ email, purpose: 'reset' });
      const resetToken = generateResetToken(user._id, user.email);
      return res.json({
        resetAllowed: true,
        resetToken,
        email: user.email,
        message: 'Code verified. You can set a new password now.',
      });
    }

    let user;

    if (purpose === 'register') {
      user = await User.findById(otpDoc.payload?.userId);
      if (!user) {
        user = await User.findOne({ email });
      }
      if (!user) {
        await otpDoc.deleteOne();
        return res.status(404).json({ message: 'Signup session expired. Please register again.' });
      }
      user.emailVerified = true;
      user.status = 'active';
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.findById(otpDoc.payload?.userId);
      if (!user) {
        user = await User.findOne({ email });
      }
      if (!user) {
        await otpDoc.deleteOne();
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Account suspended. Contact support.' });
      }
      user.emailVerified = true;
      if (user.status === 'pending') {
        user.status = 'active';
      }
      user.lastLoginAt = new Date();
      await user.save();
    }

    await EmailOtp.deleteMany({ email, purpose });

    const token = generateToken(user._id, user.role);
    res.json({
      token,
      user: toUserResponse(user),
    });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    res.status(500).json({ message: 'Unable to verify code' });
  }
};

const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const normalizedEmail = String(req.body.email || '').trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found for this email' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended. Contact support.' });
    }

    await issueOtp({
      email: normalizedEmail,
      purpose: 'reset',
      payload: { userId: user._id.toString() },
    });

    return res.json({
      requiresOtp: true,
      purpose: 'reset',
      email: normalizedEmail,
      message: 'Password reset code sent to your email',
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return respondMailError(res, error, 'Unable to send password reset code');
  }
};

const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
  const resetToken = String(req.body.resetToken || '').trim();
  const password = String(req.body.password || '');

  try {
    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Reset session expired. Request a new code.' });
    }

    if (payload.purpose !== 'reset' || String(payload.email || '').toLowerCase() !== normalizedEmail) {
      return res.status(400).json({ message: 'Invalid password reset session' });
    }

    const user = await User.findById(payload.id);
    if (!user || user.email !== normalizedEmail) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended. Contact support.' });
    }

    user.password = password;
    user.emailVerified = true;
    if (user.status === 'pending') {
      user.status = 'active';
    }
    await user.save();

    await EmailOtp.deleteMany({ email: normalizedEmail, purpose: 'reset' });

    return res.json({
      message: 'Password updated successfully. You can sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Unable to reset password' });
  }
};

const resendOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const email = String(req.body.email || '').trim().toLowerCase();
  const purpose = req.body.purpose;

  try {
    const existing = await EmailOtp.findOne({ email, purpose }).sort({ createdAt: -1 });
    if (!existing) {
      return res.status(400).json({ message: 'No pending verification found. Start login or signup again.' });
    }

    await issueOtp({
      email,
      purpose,
      payload: existing.payload,
    });

    res.json({
      requiresOtp: true,
      purpose,
      email,
      message: 'A new verification code was sent to your email',
    });
  } catch (error) {
    console.error('Resend OTP error:', error.message);
    return respondMailError(res, error, 'Unable to resend verification code');
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(toUserResponse(user));
  } catch (error) {
    console.error('Get current user error:', error.message);
    res.status(500).json({ message: 'Unable to load profile' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ownedContacts = await ProviderProfile.find({ owner: user._id });
    ownedContacts.forEach((contact) => {
      deleteUploadedFile(contact.imageUrl);
    });

    await ProviderProfile.deleteMany({ owner: user._id });
    await EmailOtp.deleteMany({ email: user.email });
    await user.deleteOne();

    res.json({ message: 'Account and all related contacts deleted' });
  } catch (error) {
    console.error('Delete account error:', error.message);
    res.status(500).json({ message: 'Unable to delete account' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  deleteAccount,
};
