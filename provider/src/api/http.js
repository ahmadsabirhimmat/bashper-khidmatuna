import { getAuthToken } from '../utils/authStorage';

const isDev = import.meta.env.DEV;
const PRODUCTION_API = 'https://bashper-khidmatuna.onrender.com';
const fromEnv = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const API_BASE_URL = fromEnv || (isDev ? 'http://localhost:4000' : PRODUCTION_API);

export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return '';
  }
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return '';
  }
  if (/^data:/i.test(trimmed)) {
    return trimmed;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith('/uploads/')) {
        return `${API_BASE_URL}${parsed.pathname}`;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }
  const pathname = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_BASE_URL}${pathname}`;
};

const buildUrl = (path) => {
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

const encodeQuery = (query = {}) => {
  const filtered = Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (!filtered.length) {
    return '';
  }
  return `?${new URLSearchParams(filtered).toString()}`;
};

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

let csrfToken = '';
let csrfInFlight = null;

const needsCsrf = (method, path) => {
  if (SAFE_METHODS.has(String(method || 'GET').toUpperCase())) {
    return false;
  }
  return path !== '/api/csrf-token' && path !== '/health';
};

const fetchCsrfToken = async () => {
  if (csrfInFlight) {
    return csrfInFlight;
  }
  csrfInFlight = (async () => {
    const response = await fetch(buildUrl('/api/csrf-token'), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.csrfToken) {
      const error = new Error(data?.message || 'Unable to start a secure session.');
      error.status = response.status;
      throw error;
    }
    csrfToken = data.csrfToken;
    return csrfToken;
  })().finally(() => {
    csrfInFlight = null;
  });
  return csrfInFlight;
};

const ensureCsrfToken = async (method, path) => {
  if (!needsCsrf(method, path)) {
    return '';
  }
  if (!csrfToken) {
    await fetchCsrfToken();
  }
  return csrfToken;
};

const clearCsrfToken = () => {
  csrfToken = '';
};

export const apiRequest = async (path, { method = 'GET', headers = {}, body, query, signal, _csrfRetry } = {}) => {
  const url = `${buildUrl(path)}${encodeQuery(query)}`;
  const token = getAuthToken();

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

  const csrf = await ensureCsrfToken(method, path);
  if (csrf) {
    config.headers['X-CSRF-Token'] = csrf;
  }

  if (body instanceof FormData) {
    delete config.headers['Content-Type'];
    config.body = body;
  } else if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 403 && isJson && data?.code === 'CSRF' && !_csrfRetry) {
      clearCsrfToken();
      return apiRequest(path, { method, headers, body, query, signal, _csrfRetry: true });
    }
    let message = 'Request failed';
    if (isJson) {
      if (typeof data?.message === 'string' && data.message.trim()) {
        message = data.message;
      } else if (Array.isArray(data?.errors) && data.errors.length) {
        message = data.errors
          .map((item) => item.msg || item.message)
          .filter(Boolean)
          .join('. ');
      }
    } else if (typeof data === 'string' && data.trim()) {
      message = data;
    }
    const error = new Error(message || 'Request failed');
    error.status = response.status;
    error.details = isJson ? data?.errors : undefined;
    throw error;
  }

  return data;
};
