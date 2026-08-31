const { rateLimit } = require('express-rate-limit');

const jsonMessage = (message) => ({ message });

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 400,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || req.path === '/health',
  message: jsonMessage('Too many requests. Please wait a few minutes and try again.'),
});

const csrfTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 80,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Too many CSRF token requests. Please wait and try again.'),
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Too many sign-in attempts. Please wait 15 minutes and try again.'),
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Too many verification attempts. Please wait and try again.'),
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 80,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase()),
  message: jsonMessage('Too many updates. Please wait and try again.'),
});

module.exports = {
  apiLimiter,
  csrfTokenLimiter,
  authLimiter,
  otpLimiter,
  writeLimiter,
};
