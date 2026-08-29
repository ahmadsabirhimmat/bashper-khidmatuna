const TOKEN_KEY = 'bk_admin_token';
const USER_KEY = 'bk_admin_user';

export const persistSession = (token, user) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const readSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return null;
  }
  try {
    const userRaw = localStorage.getItem(USER_KEY);
    const user = userRaw ? JSON.parse(userRaw) : null;
    if (!user) {
      return null;
    }
    return { token, user };
  } catch (error) {
    console.error('Failed to parse admin session', error);
    clearSession();
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || '';
