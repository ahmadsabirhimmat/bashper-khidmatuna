const dns = require('dns');
const nodemailer = require('nodemailer');

// Paid Render / local: Node 17+ prefers IPv6; force IPv4 for smtp.gmail.com.
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

let cachedTransporter = null;

const getMailConfig = () => {
  const user = (process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_APP_PASSWORD || '')
    .trim()
    .replace(/\s+/g, '');
  const brevoKey = (process.env.BREVO_API_KEY || '').trim();
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  return { user, pass, brevoKey, resendKey };
};

const isOtpDevMode = () =>
  String(process.env.OTP_DEV_MODE || '').toLowerCase() === 'true';

/** HTTPS APIs work on Render free. SMTP (Gmail :587) is blocked on free web services. */
const getMailTransport = () => {
  if (isOtpDevMode()) return 'dev';
  const { user, pass, brevoKey, resendKey } = getMailConfig();
  if (brevoKey) return 'brevo';
  if (resendKey) return 'resend';
  if (user && pass) return 'smtp';
  return 'none';
};

const assertMailReady = () => {
  if (isOtpDevMode()) {
    return;
  }
  if (getMailTransport() === 'none') {
    const error = new Error(
      'Email is not configured. On Render free, set BREVO_API_KEY or RESEND_API_KEY (HTTPS). Gmail SMTP only works on a paid Render instance or locally.'
    );
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }
};

const createTransport = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const { user, pass } = getMailConfig();
  if (!user || !pass) {
    const error = new Error(
      'Gmail is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env'
    );
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    family: 4,
    auth: { user, pass },
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    rateDelta: 1000,
    rateLimit: 5,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return cachedTransporter;
};

const purposeAction = (purpose) => {
  if (purpose === 'register') return 'sign up';
  if (purpose === 'reset') return 'reset your password';
  return 'sign in';
};

const buildMailContent = ({ code, purpose }) => {
  const action = purposeAction(purpose);
  const subject =
    purpose === 'reset'
      ? 'Your Bashper Khidmatuna password reset code'
      : 'Your Bashper Khidmatuna verification code';
  const text = `Your verification code is ${code}. It expires in 10 minutes. Use this code to ${action} to Bashper Khidmatuna.`;
  const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0B254A;">
        <h2>Bashper Khidmatuna</h2>
        <p>Your verification code to ${action} is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${code}</p>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `;
  return { subject, text, html };
};

const throwHttpMailError = (provider, status, bodyText) => {
  const error = new Error(`${provider} email failed (${status}): ${String(bodyText || '').slice(0, 240)}`);
  error.code = status === 401 || status === 403 ? 'EMAIL_AUTH_FAILED' : 'EMAIL_HTTP_FAILED';
  throw error;
};

const sendViaBrevo = async ({ to, subject, text, html }) => {
  const { user, brevoKey } = getMailConfig();
  const sender = (process.env.MAIL_FROM || user || '').trim();
  if (!sender) {
    const error = new Error('Set GMAIL_USER or MAIL_FROM as the verified Brevo sender email.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': brevoKey,
    },
    body: JSON.stringify({
      sender: { name: 'Bashper Khidmatuna', email: sender },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    throwHttpMailError('Brevo', response.status, await response.text());
  }
};

const sendViaResend = async ({ to, subject, text, html }) => {
  const { user, resendKey } = getMailConfig();
  const sender = (process.env.MAIL_FROM || user || '').trim();
  if (!sender) {
    const error = new Error('Set MAIL_FROM to a verified Resend sender (for example bashper@your-domain.com).');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Bashper Khidmatuna <${sender}>`,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    throwHttpMailError('Resend', response.status, await response.text());
  }
};

const sendViaSmtp = async ({ to, subject, text, html }) => {
  const { user } = getMailConfig();
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"Bashper Khidmatuna" <${user}>`,
    to,
    subject,
    text,
    html,
  });
};

const sendOtpEmail = async ({ to, code, purpose }) => {
  if (isOtpDevMode()) {
    console.log('────────────────────────────────────────');
    console.log(`[OTP_DEV_MODE] To: ${to}`);
    console.log(`[OTP_DEV_MODE] Purpose: ${purpose}`);
    console.log(`[OTP_DEV_MODE] Code: ${code}`);
    console.log('────────────────────────────────────────');
    return;
  }

  const { subject, text, html } = buildMailContent({ code, purpose });
  const transport = getMailTransport();
  const payload = { to, subject, text, html };

  if (transport === 'brevo') {
    await sendViaBrevo(payload);
    return;
  }
  if (transport === 'resend') {
    await sendViaResend(payload);
    return;
  }
  if (transport === 'smtp') {
    await sendViaSmtp(payload);
    return;
  }

  const error = new Error(
    'Email is not configured. On Render free, set BREVO_API_KEY or RESEND_API_KEY.'
  );
  error.code = 'EMAIL_NOT_CONFIGURED';
  throw error;
};

/** Queue email in the background so API responses stay fast. */
const sendOtpEmailBackground = (payload) => {
  Promise.resolve()
    .then(() => sendOtpEmail(payload))
    .catch((error) => {
      console.error('[otp-email] Background send failed:', error.message);
      if (/ECONNECTION|ETIMEDOUT|ENETUNREACH|EAUTH|Invalid login/i.test(String(error.message || ''))) {
        cachedTransporter = null;
      }
    });
};

module.exports = {
  sendOtpEmail,
  sendOtpEmailBackground,
  getMailConfig,
  getMailTransport,
  isOtpDevMode,
  assertMailReady,
};
