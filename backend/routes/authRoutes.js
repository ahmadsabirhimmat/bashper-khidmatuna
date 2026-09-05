const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  googleAuth,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  getCurrentUser,
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
  ],
  loginUser
);

router.post(
  '/google',
  authLimiter,
  [
    body('idToken').notEmpty().withMessage('Google credential is required'),
    body('role').optional().isIn(['provider', 'beneficiary']).withMessage('Invalid role'),
  ],
  googleAuth
);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Valid email is required')],
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
  ],
  verifyOtp
);

router.post(
  '/resend-otp',
  otpLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('purpose').isIn(otpPurposes).withMessage('Invalid verification purpose'),
  ],
  resendOtp
);

router.get('/me', authenticate, getCurrentUser);

router.delete('/delete', authenticate, deleteAccount);

module.exports = router;
