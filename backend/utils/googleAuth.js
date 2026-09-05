const { OAuth2Client } = require('google-auth-library');

const uniqueClientIds = () =>
  [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);

const isGoogleAuthConfigured = () => uniqueClientIds().length > 0;

let client;

const getClient = () => {
  if (!client) {
    client = new OAuth2Client();
  }
  return client;
};

const verifyGoogleIdToken = async (idToken) => {
  const audiences = uniqueClientIds();
  if (!audiences.length) {
    const error = new Error('Google sign-in is not configured on the server.');
    error.code = 'GOOGLE_NOT_CONFIGURED';
    throw error;
  }

  const ticket = await getClient().verifyIdToken({
    idToken,
    audience: audiences,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid Google credential');
  }
  return payload;
};

module.exports = {
  isGoogleAuthConfigured,
  verifyGoogleIdToken,
};
