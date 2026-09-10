const crypto = require('crypto');

const TICKET_TTL_MS = 10 * 60 * 1000;
const tickets = new Map();

const publicApiUrl = () =>
  String(process.env.PUBLIC_API_URL || process.env.RENDER_EXTERNAL_URL || '')
    .trim()
    .replace(/\/$/, '');

const googleRedirectUri = () => {
  const base = publicApiUrl();
  if (!base) {
    return '';
  }
  return `${base}/api/auth/google/callback`;
};

const pruneTickets = () => {
  const now = Date.now();
  tickets.forEach((ticket, id) => {
    if (ticket.expiresAt <= now) {
      tickets.delete(id);
    }
  });
};

const DEFAULT_WEB_ORIGINS = [
  'http://localhost:5175',
  'http://localhost:4175',
  'http://localhost:5176',
  'http://localhost:4176',
  'https://bashper-khidmatuna-1.onrender.com',
  'https://bashper-khidmatuna-provider.onrender.com',
];

const allowedGoogleReturnOrigins = () => {
  const origins = new Set(DEFAULT_WEB_ORIGINS);
  String(process.env.CLIENT_URL || '')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean)
    .forEach((origin) => origins.add(origin));

  [...origins].forEach((origin) => {
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost') {
        origins.add(`${url.protocol}//127.0.0.1${url.port ? `:${url.port}` : ''}`);
      }
      if (url.hostname === '127.0.0.1') {
        origins.add(`${url.protocol}//localhost${url.port ? `:${url.port}` : ''}`);
      }
    } catch {
      origins.delete(origin);
    }
  });
  return origins;
};

const isAllowedGoogleReturnTo = (value) => {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    if (url.username || url.password) {
      return false;
    }
    return allowedGoogleReturnOrigins().has(url.origin);
  } catch {
    return false;
  }
};

const appendQuery = (base, params = {}) => {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const createTicket = (codeVerifier, extra = {}) => {
  pruneTickets();
  const id = crypto.randomBytes(24).toString('hex');
  tickets.set(id, {
    status: 'pending',
    codeVerifier,
    role: extra.role || 'beneficiary',
    returnTo: extra.returnTo || '',
    allowCreate: Boolean(extra.allowCreate),
    expiresAt: Date.now() + TICKET_TTL_MS,
  });
  return id;
};

const getTicket = (id) => {
  pruneTickets();
  return tickets.get(id) || null;
};

const completeTicket = (id, result) => {
  const ticket = getTicket(id);
  if (!ticket) {
    return false;
  }
  tickets.set(id, {
    ...ticket,
    ...result,
    codeVerifier: undefined,
  });
  return true;
};

const consumeTicket = (id) => {
  const ticket = getTicket(id);
  if (!ticket) {
    return null;
  }
  if (ticket.status === 'ready' || ticket.status === 'failed') {
    tickets.delete(id);
  }
  return ticket;
};

const pkcePair = () => {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
};

const htmlPage = (title, body, { redirectTo } = {}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  ${redirectTo ? `<meta http-equiv="refresh" content="0;url=${redirectTo}" />` : ''}
  <style>
    body { font-family: sans-serif; background: #0B254A; color: #fff; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { max-width: 360px; text-align: center; }
    h1 { font-size: 22px; margin: 0 0 12px; }
    p { color: #c9d7ee; line-height: 1.5; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${body}</p>
  </div>
  ${
    redirectTo
      ? `<script>window.location.replace(${JSON.stringify(redirectTo)});</script>`
      : ''
  }
</body>
</html>`;

/** Deep link that returns the in-app browser to Bashper after Google finishes. */
const APP_GOOGLE_RETURN = 'bashperkhidmatuna://auth/google';

module.exports = {
  publicApiUrl,
  googleRedirectUri,
  createTicket,
  getTicket,
  completeTicket,
  consumeTicket,
  pkcePair,
  htmlPage,
  appendQuery,
  isAllowedGoogleReturnTo,
  APP_GOOGLE_RETURN,
};
