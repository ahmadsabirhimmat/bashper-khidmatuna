const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter, otpLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const otpPurposes = ['login', 'register', 'reset'];

router.post(
  '/register',
  authLimiter,
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^(\+93|0)?[\d\s-]{8,15}$/)
      .withMessage('Enter a valid Afghanistan phone number'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['provider', 'beneficiary']).withMessage('Invalid role'),
  ],
  registerUser
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').optional().isIn(['admin', 'provider', 'beneficiary']).withMessage('Invalid role'),
  ],
  loginUser
);

router.post(
  '/google',
  authLimiter,
  [
    body('idToken').optional().isString(),
    body('code').optional().isString(),
    body('codeVerifier').optional().isString(),
    body('redirectUri').optional().isString(),
    body('role').optional().isIn(['admin', 'provider', 'beneficiary']).withMessage('Invalid role'),
    body('allowCreate').optional().isBoolean(),
  ],
  loginWithGoogle
);

router.post(
  '/google/start',
  authLimiter,
  [
    body('role').optional().isIn(['admin', 'provider', 'beneficiary']).withMessage('Invalid role'),
    body('returnTo').optional().isString(),
    body('allowCreate').optional().isBoolean(),
  ],
  startGoogleLogin
);
router.get('/google/callback', authLimiter, googleOAuthCallback);
router.get('/google/ticket/:ticketId', authLimiter, getGoogleTicket);

router.post(
  '/forgot-password',
  authLimiter,
  [    body('email').isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['admin', 'provider', 'beneficiary']).withMessage('Invalid role'),
  ],
  forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  resetPassword
);

router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('code')
      .isLength({ min: 6, max: 6 })
      .withMessage('Enter the 6-digit verification code')
      .isNumeric()
      .withMessage('Verification code must be numeric'),
    body('purpose').isIn(otpPurposes).withMessage('Invalid verification purpose'),
    body('role').optional().isIn(['admin', 'provider', 'beneficiary']).withMessage('Invalid role'),
  ],
  verifyOtp
);

router.post(
  '/resend-otp',
  otpLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('purpose').isIn(otpPurposes).withMessage('Invalid verification purpose'),
    body('role').optional().isIn(['admin', 'provider', 'beneficiary']).withMessage('Invalid role'),
  ],
  resendOtp
);

router.get('/me', authenticate, getCurrentUser);

router.patch(
  '/me',
  authenticate,
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phoneNumber')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^(\+93|0)?[\d\s-]{8,15}$/)
      .withMessage('Enter a valid Afghanistan phone number'),
  ],
  updateProfile
);

router.put(
  '/me',
  authenticate,
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phoneNumber')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^(\+93|0)?[\d\s-]{8,15}$/)
      .withMessage('Enter a valid Afghanistan phone number'),
  ],
  updateProfile
);

router.delete('/delete', authenticate, deleteAccount);

module.exports = router;
