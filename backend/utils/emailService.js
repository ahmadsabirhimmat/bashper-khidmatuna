const dns = require('dns');
const nodemailer = require('nodemailer');

// Render's outbound network is IPv4-only. Node 17+ prefers IPv6, which
// makes smtp.gmail.com fail with ENETUNREACH on 2607:f8b0:...:587.
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

let cachedTransporter = null;

const getMailConfig = () => {
  const user = (process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_APP_PASSWORD || '')
    .trim()
    .replace(/\s+/g, '');
  return { user, pass };
};

const isOtpDevMode = () =>
  String(process.env.OTP_DEV_MODE || '').toLowerCase() === 'true';

const assertMailReady = () => {
  if (isOtpDevMode()) {
    return;
  }
  const { user, pass } = getMailConfig();
  if (!user || !pass) {
    const error = new Error(
      'Gmail is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD on the API service in Render, then restart it.'
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

const sendOtpEmail = async ({ to, code, purpose }) => {
  const action = purposeAction(purpose);

  if (isOtpDevMode()) {
    console.log('────────────────────────────────────────');
    console.log(`[OTP_DEV_MODE] To: ${to}`);
    console.log(`[OTP_DEV_MODE] Purpose: ${purpose}`);
    console.log(`[OTP_DEV_MODE] Code: ${code}`);
    console.log('────────────────────────────────────────');
    return;
  }

  const { user } = getMailConfig();
  const transporter = createTransport();
  const subject =
    purpose === 'reset'
      ? 'Your Bashper Khidmatuna password reset code'
      : 'Your Bashper Khidmatuna verification code';

  await transporter.sendMail({
    from: `"Bashper Khidmatuna" <${user}>`,
    to,
    subject,
    text: `Your verification code is ${code}. It expires in 10 minutes. Use this code to ${action} to Bashper Khidmatuna.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0B254A;">
        <h2>Bashper Khidmatuna</h2>
        <p>Your verification code to ${action} is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${code}</p>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};

/** Queue email in the background so API responses stay fast. */
const sendOtpEmailBackground = (payload) => {
  Promise.resolve()
    .then(() => sendOtpEmail(payload))
    .catch((error) => {
      console.error('[otp-email] Background send failed:', error.message);
      // Reset transporter if the pooled connection went bad.
      if (/ECONNECTION|ETIMEDOUT|ENETUNREACH|EAUTH|Invalid login/i.test(String(error.message || ''))) {
        cachedTransporter = null;
      }
    });
};

module.exports = {
  sendOtpEmail,
  sendOtpEmailBackground,
  getMailConfig,
  isOtpDevMode,
  assertMailReady,
};
