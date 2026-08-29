import { clearSession, getStoredToken } from '../utils/session';

const isDev = import.meta.env.DEV;
const PRODUCTION_API = 'https://bashper-khidmatuna.onrender.com';
const fallbackDevBase = 'http://localhost:4000';
const baseFromEnv = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const resolvedBase = baseFromEnv || (isDev ? fallbackDevBase : PRODUCTION_API);
const API_BASE_URL = resolvedBase;
const AUTH_EVENT = 'bk-auth-expired';

const buildUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  try {
    return new URL(normalizedPath, API_BASE_URL).toString();
  } catch (error) {
    console.warn('Falling back to string concatenation for API URL', { error, normalizedPath });
    return `${API_BASE_URL}${normalizedPath}`;
  }
};

const encodeQuery = (query = {}) => {
  const preparedEntries = Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (!preparedEntries.length) {
    return '';
  }
  return `?${new URLSearchParams(preparedEntries).toString()}`;
};

const broadcastAuthReset = () => {
  clearSession();
  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
};

export const subscribeToAuthReset = (listener) => {
  window.addEventListener(AUTH_EVENT, listener);
  return () => window.removeEventListener(AUTH_EVENT, listener);
};

export const apiRequest = async (path, { method = 'GET', headers = {}, body, query, signal } = {}) => {
  const url = `${buildUrl(path)}${encodeQuery(query)}`;
  const token = getStoredToken();

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    signal,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (body instanceof FormData) {
    delete config.headers['Content-Type'];
    config.body = body;
  } else if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkFailure) {
    if (networkFailure?.name === 'AbortError') {
      throw networkFailure;
    }
    const error = new Error('Unable to reach the emergency contacts API. Ensure the server is running.');
    error.cause = networkFailure;
    error.isNetworkError = true;
    throw error;
  }
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      broadcastAuthReset();
    }
    const error = new Error((isJson && payload?.message) || payload || 'Request failed');
    error.status = response.status;
    error.details = isJson ? payload?.errors : undefined;
    throw error;
  }

  return payload;
};
