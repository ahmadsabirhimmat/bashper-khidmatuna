const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailOtp = require('../models/EmailOtp');
const ProviderProfile = require('../models/ProviderProfile');
const {
  sendOtpEmail,
  sendOtpEmailBackground,
  isOtpDevMode,
  assertMailReady,
} = require('../utils/emailService');
const { deleteUploadedFile } = require('../middleware/uploadMiddleware');
const {
  googleRedirectUri,
  createTicket,
  getTicket,
  completeTicket,
  pkcePair,
  htmlPage,
  appendQuery,
  isAllowedGoogleReturnTo,
  APP_GOOGLE_RETURN,
} = require('../utils/googleOAuth');

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/** Session tokens stay valid until the client logs out (no time-based expiry). */
const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET);

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

const AUTH_ROLES = User.ROLES || ['admin', 'provider', 'beneficiary'];

const normalizeRole = (value) => {
  const role = String(value || '').trim().toLowerCase();
  return AUTH_ROLES.includes(role) ? role : '';
};

const findOtpDoc = async (email, purpose, role) => {
  if (role) {
    const scoped = await EmailOtp.findOne({ email, purpose, role }).sort({ createdAt: -1 });
    if (scoped) {
      return scoped;
    }
    return EmailOtp.findOne({
      email,
      purpose,
      $or: [{ role: { $exists: false } }, { role: null }],
    }).sort({ createdAt: -1 });
  }
  return EmailOtp.findOne({ email, purpose }).sort({ createdAt: -1 });
};

const deleteOtps = (email, purpose, role) => {
  const filter = { email, purpose };
  if (role) {
    filter.role = role;
  } else {
    filter.$or = [{ role: { $exists: false } }, { role: null }];
  }
  return EmailOtp.deleteMany(filter);
};

const deleteOtpsForUser = (user) =>
  EmailOtp.deleteMany({
    $or: [{ email: user.email, role: user.role }, { 'payload.userId': user._id.toString() }],
  });

const resolveUserFromOtp = async (otpDoc, email) => {
  if (otpDoc?.payload?.userId) {
    const byId = await User.findById(otpDoc.payload.userId);
    if (byId) {
      return byId;
    }
  }
  const role = normalizeRole(otpDoc?.role || otpDoc?.payload?.role);
  if (role) {
    return User.findOne({ email, role });
  }
  const users = await User.find({ email });
  return users.length === 1 ? users[0] : null;
};

const findUserForLogin = async (email, role, password) => {
  if (role) {
    return User.findOne({ email, role });
  }

  const users = await User.find({ email });
  if (users.length <= 1) {
    return users[0] || null;
  }

  const matches = [];
  for (const user of users) {
    if (await user.comparePassword(password)) {
      matches.push(user);
    }
  }
  if (matches.length === 1) {
    return matches[0];
  }
  if (matches.length === 0) {
    return null;
  }
  const error = new Error(
    'This email is used on more than one app. Sign in from the mobile app, provider portal, or admin console.'
  );
  error.status = 400;
  throw error;
};

const hashOtp = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');

const createOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const respondMailError = (res, error, fallbackMessage) => {
  if (error.code === 'EMAIL_NOT_CONFIGURED') {
    return res.status(503).json({ message: error.message });
  }

  const msg = String(error.message || '');
  if (/ENETUNREACH|ETIMEDOUT|ECONNECTION/i.test(msg)) {
    return res.status(503).json({
      message:
        'Render free plans block Gmail SMTP. Upgrade the API to a paid instance, or set BREVO_API_KEY / RESEND_API_KEY to send OTP email over HTTPS.',
    });
  }
  if (error.code === 'EMAIL_HTTP_FAILED' || error.code === 'EMAIL_AUTH_FAILED') {
    return res.status(503).json({ message: error.message });
  }
  if (/Invalid login|BadCredentials|Username and Password not accepted/i.test(msg)) {
    return res.status(503).json({
      message:
        'Email service login failed. Set a valid Gmail App Password in backend/.env and restart the server.',
    });
  }

  return res.status(500).json({ message: fallbackMessage });
};

const issueOtp = async ({ email, purpose, payload, role }) => {
  const code = createOtpCode();
  const normalizedEmail = email.trim().toLowerCase();
  const otpRole = normalizeRole(role);

  await deleteOtps(normalizedEmail, purpose, otpRole || undefined);
  await EmailOtp.create({
    email: normalizedEmail,
    codeHash: hashOtp(code),
    purpose,
    role: otpRole || undefined,
    payload,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  assertMailReady();

  // Production waits for Gmail so "code sent" is only shown when the email went out.
  // Local dev keeps SMTP off the request path so the UI stays fast.
  if (process.env.NODE_ENV === 'production' && !isOtpDevMode()) {
    await sendOtpEmail({ to: normalizedEmail, code, purpose });
  } else {
    sendOtpEmailBackground({ to: normalizedEmail, code, purpose });
  }
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
    const existingUser = await User.findOne({ email: normalizedEmail, role });
    if (existingUser) {
      if (
        (role === 'beneficiary' || role === 'provider') &&
        existingUser.role === role &&
        !existingUser.emailVerified
      ) {
        await issueOtp({
          email: normalizedEmail,
          purpose: 'register',
          role,
          payload: { userId: existingUser._id.toString(), role },
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
          role,
          payload: { userId: user._id.toString(), role },
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
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Account already exists for this email' });
    }
    console.error('Register error:', error.message);
    return respondMailError(res, error, 'Unable to create account');
  }
};

const googleAudiences = () =>
  [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

const verifyGoogleIdToken = async (idToken) => {
  const audiences = googleAudiences();
  if (!audiences.length) {
    const error = new Error('Google sign-in is not configured on the server.');
    error.status = 503;
    throw error;
  }

  const client = new OAuth2Client(audiences[0]);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: audiences.length === 1 ? audiences[0] : audiences,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid Google token');
  }
  return payload;
};

const allowedGoogleRedirects = () =>
  new Set(
    [
      'https://auth.expo.io/@sabirhimmatts-team/bashper-khidmatuna',
      googleRedirectUri(),
      'http://localhost:4000/api/auth/google/callback',
    ].filter(Boolean)
  );

const upsertGoogleUser = async (payload, requestedRole, options = {}) => {
  const role = normalizeRole(requestedRole) || 'beneficiary';
  const allowCreate = role === 'beneficiary' ? true : Boolean(options.allowCreate);
  const email = String(payload.email || '').trim().toLowerCase();
  const googleId = String(payload.sub || '').trim();
  const fullName = String(payload.name || '').trim() || email.split('@')[0] || 'Google user';

  if (!email || !googleId) {
    const error = new Error('Google did not return a valid account.');
    error.status = 401;
    throw error;
  }
  if (payload.email_verified === false) {
    const error = new Error('Verify your Google email, then try again.');
    error.status = 401;
    throw error;
  }

  let user = await User.findOne({ $or: [{ googleId, role }, { email, role }] });

  if (user && user.role !== role) {
    const error = new Error('Use the provider portal or admin console to sign in with this email.');
    error.status = 400;
    throw error;
  }

  if (user) {
    if (user.status === 'suspended') {
      const error = new Error('Account suspended. Contact support.');
      error.status = 403;
      throw error;
    }
    if (user.googleId && user.googleId !== googleId) {
      const error = new Error('This email is linked to a different Google account.');
      error.status = 401;
      throw error;
    }
    if (!user.googleId) {
      user.googleId = googleId;
    }
    user.emailVerified = true;
    if (user.status === 'pending') {
      user.status = 'active';
    }
    if (!user.fullName) {
      user.fullName = fullName;
    }
    user.lastLoginAt = new Date();
    await user.save();
  } else if (role === 'admin' || !allowCreate) {
    const error = new Error(
      role === 'admin'
        ? 'No admin account exists for this Google email.'
        : 'No provider account exists for this email. Request access first.'
    );
    error.status = 403;
    throw error;
  } else {
    user = await User.create({
      fullName,
      email,
      phoneNumber: '',
      googleId,
      role,
      status: 'active',
      emailVerified: true,
      lastLoginAt: new Date(),
    });
  }

  return {
    token: generateToken(user._id, user.role),
    user: toUserResponse(user),
  };
};

const exchangeGoogleCode = async (code, codeVerifier, redirectUri) => {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) {
    const error = new Error('Google sign-in is not configured on the server.');
    error.status = 503;
    throw error;
  }
  if (!allowedGoogleRedirects().has(redirectUri)) {
    const error = new Error('Invalid Google redirect.');
    error.status = 400;
    throw error;
  }

  const client = new OAuth2Client(clientId, clientSecret, redirectUri);
  const { tokens } = await client.getToken({
    code,
    codeVerifier,
    redirect_uri: redirectUri,
  });
  if (!tokens.id_token) {
    throw new Error('Google did not return an ID token.');
  }
  return verifyGoogleIdToken(tokens.id_token);
};

const loginWithGoogle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const idToken = String(req.body.idToken || '').trim();
    const code = String(req.body.code || '').trim();
    const codeVerifier = String(req.body.codeVerifier || '').trim();
    const redirectUri = String(req.body.redirectUri || '').trim();
    const role = normalizeRole(req.body.role) || 'beneficiary';
    const allowCreate = role === 'beneficiary' ? true : req.body.allowCreate === true;

    const payload = idToken
      ? await verifyGoogleIdToken(idToken)
      : code && codeVerifier && redirectUri
        ? await exchangeGoogleCode(code, codeVerifier, redirectUri)
        : null;

    if (!payload) {
      return res.status(400).json({ message: 'Google sign-in token is required' });
    }
    const session = await upsertGoogleUser(payload, role, { allowCreate });
    return res.json(session);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Google login error:', error.message);
    return res.status(401).json({ message: 'Google sign-in failed. Try again.' });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role: requestedRole } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const role = normalizeRole(requestedRole);
    let user;
    try {
      user = await findUserForLogin(normalizedEmail, role, password);
    } catch (lookupError) {
      if (lookupError.status === 400) {
        return res.status(400).json({ message: lookupError.message });
      }
      throw lookupError;
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({
        message: 'This account uses Google sign-in. Tap Continue with Google.',
      });
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
      role: user.role,
      payload: { userId: user._id.toString(), role: user.role },
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
  const role = normalizeRole(req.body.role);

  try {
    const otpDoc = await findOtpDoc(email, purpose, role);
    if (!otpDoc) {
      console.warn(`Verify OTP: no code for email=${email} purpose=${purpose} role=${role || 'any'}`);
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
      const user = await resolveUserFromOtp(otpDoc, email);
      if (!user) {
        await otpDoc.deleteOne();
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Account suspended. Contact support.' });
      }

      await deleteOtps(email, 'reset', user.role);
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
      user = await resolveUserFromOtp(otpDoc, email);
      if (!user) {
        await otpDoc.deleteOne();
        return res.status(404).json({ message: 'Signup session expired. Please register again.' });
      }
      user.emailVerified = true;
      user.status = 'active';
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await resolveUserFromOtp(otpDoc, email);
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

    await deleteOtps(email, purpose, user.role);

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
  const role = normalizeRole(req.body.role);

  try {
    let user;
    if (role) {
      user = await User.findOne({ email: normalizedEmail, role });
    } else {
      const users = await User.find({ email: normalizedEmail });
      if (users.length > 1) {
        return res.status(400).json({
          message:
            'This email is used on more than one app. Reset the password from the mobile app, provider portal, or admin console.',
        });
      }
      user = users[0];
    }
    if (!user) {
      return res.status(404).json({ message: 'No account found for this email' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended. Contact support.' });
    }

    await issueOtp({
      email: normalizedEmail,
      purpose: 'reset',
      role: user.role,
      payload: { userId: user._id.toString(), role: user.role },
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

    await deleteOtps(normalizedEmail, 'reset', user.role);

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
  const role = normalizeRole(req.body.role);

  try {
    const existing = await findOtpDoc(email, purpose, role);
    if (!existing) {
      return res.status(400).json({ message: 'No pending verification found. Start login or signup again.' });
    }

    await issueOtp({
      email,
      purpose,
      role: normalizeRole(existing.role || existing.payload?.role || role),
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

const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array().map((item) => item.msg).filter(Boolean).join('. ') || 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = String(req.body.fullName || '').trim();
    user.phoneNumber = String(req.body.phoneNumber || '').trim();
    await user.save();
    res.json(toUserResponse(user));
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Unable to update profile' });
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
    await deleteOtpsForUser(user);
    await user.deleteOne();

    res.json({ message: 'Account and all related contacts deleted' });
  } catch (error) {
    console.error('Delete account error:', error.message);
    res.status(500).json({ message: 'Unable to delete account' });
  }
};

const startGoogleLogin = async (req, res) => {
  try {
    const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
    const redirectUri = googleRedirectUri();
    if (!clientId || !redirectUri || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({ message: 'Google sign-in is not configured on the server.' });
    }

    const role = normalizeRole(req.body?.role) || 'beneficiary';
    const returnTo = String(req.body?.returnTo || '').trim();
    const allowCreate = role === 'beneficiary' ? true : req.body?.allowCreate === true;

    if (returnTo && !isAllowedGoogleReturnTo(returnTo)) {
      return res.status(400).json({ message: 'Invalid Google return URL.' });
    }

    const { verifier, challenge } = pkcePair();
    const ticketId = createTicket(verifier, { role, returnTo, allowCreate });
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: ticketId,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      prompt: 'select_account',
      access_type: 'online',
    });

    return res.json({
      ticketId,
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    });
  } catch (error) {
    console.error('Google start error:', error.message);
    return res.status(500).json({ message: 'Unable to start Google sign-in' });
  }
};

const googleOAuthCallback = async (req, res) => {
  const ticketId = String(req.query.state || '').trim();
  const code = String(req.query.code || '').trim();
  const googleError = String(req.query.error || '').trim();
  const ticket = ticketId ? getTicket(ticketId) : null;
  const webReturn =
    ticket?.returnTo && isAllowedGoogleReturnTo(ticket.returnTo) ? ticket.returnTo : '';

  const redirectFor = (status) =>
    webReturn
      ? appendQuery(webReturn, { google_ticket: ticketId, status })
      : `${APP_GOOGLE_RETURN}?status=${status}`;

  const fail = (message) => {
    if (ticketId) {
      completeTicket(ticketId, { status: 'failed', message });
    }
    return res
      .status(400)
      .type('html')
      .send(
        htmlPage('Google sign-in failed', `${message} Returning…`, {
          redirectTo: redirectFor('failed'),
        })
      );
  };

  if (googleError) {
    return fail('Google cancelled the sign-in.');
  }

  if (!ticket || !code) {
    return fail('This Google sign-in session expired. Try again from the app.');
  }

  try {
    const payload = await exchangeGoogleCode(code, ticket.codeVerifier, googleRedirectUri());
    const session = await upsertGoogleUser(payload, ticket.role, {
      allowCreate: ticket.allowCreate,
    });
    completeTicket(ticketId, { status: 'ready', ...session });
    return res.type('html').send(
      htmlPage('Signed in', 'Returning to Bashper Khidmatuna…', {
        redirectTo: redirectFor('ready'),
      })
    );
  } catch (error) {
    console.error('Google callback error:', error.message);
    return fail(error.message || 'Google sign-in failed.');
  }
};

const getGoogleTicket = async (req, res) => {
  const ticket = getTicket(String(req.params.ticketId || '').trim());
  if (!ticket) {
    return res.json({ status: 'expired', message: 'Google sign-in expired. Try again.' });
  }
  if (ticket.status === 'failed') {
    return res.json({ status: 'failed', message: ticket.message || 'Google sign-in failed.' });
  }
  if (ticket.status !== 'ready') {
    return res.json({ status: 'pending' });
  }
  return res.json({
    status: 'ready',
    token: ticket.token,
    user: ticket.user,
  });
};

module.exports = {
  registerUser,
  loginUser,
  loginWithGoogle,
  startGoogleLogin,
  googleOAuthCallback,
  getGoogleTicket,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  deleteAccount,
};
