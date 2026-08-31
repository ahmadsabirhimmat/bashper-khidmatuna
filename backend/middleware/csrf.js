const crypto = require('crypto');

const CSRF_HEADER = 'x-csrf-token';
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const getSecret = () => process.env.CSRF_SECRET || process.env.JWT_SECRET || 'dev-csrf-secret';

const sign = (payload) =>
  crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');

const issueCsrfToken = () => {
  const payload = Buffer.from(
    JSON.stringify({
      n: crypto.randomBytes(16).toString('hex'),
      exp: Date.now() + TOKEN_TTL_MS,
    })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
};

const verifyCsrfToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  const dot = token.lastIndexOf('.');
  if (dot <= 0) {
    return false;
  }
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return false;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number(data.exp) > Date.now();
  } catch {
    return false;
  }
};

const shouldSkipCsrf = (req) => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    return true;
  }
  const path = req.path || '';
  return path === '/api/csrf-token' || path === '/health';
};

const csrfProtection = (req, res, next) => {
  if (shouldSkipCsrf(req)) {
    return next();
  }
  const token = req.get(CSRF_HEADER) || req.get('X-CSRF-Token') || '';
  if (!verifyCsrfToken(token)) {
    return res.status(403).json({
      code: 'CSRF',
      message: 'Invalid or missing CSRF token. Refresh and try again.',
    });
  }
  return next();
};

const getCsrfToken = (req, res) => {
  res.json({
    csrfToken: issueCsrfToken(),
    expiresIn: TOKEN_TTL_MS,
  });
};

module.exports = {
  csrfProtection,
  getCsrfToken,
  issueCsrfToken,
};
