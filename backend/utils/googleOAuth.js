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

const createTicket = (codeVerifier) => {
  pruneTickets();
  const id = crypto.randomBytes(24).toString('hex');
  tickets.set(id, {
    status: 'pending',
    codeVerifier,
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

const htmlPage = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
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
</body>
</html>`;

module.exports = {
  publicApiUrl,
  googleRedirectUri,
  createTicket,
  getTicket,
  completeTicket,
  consumeTicket,
  pkcePair,
  htmlPage,
};
