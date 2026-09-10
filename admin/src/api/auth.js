import { apiRequest } from './http';

export const loginUser = (credentials) =>
  apiRequest('/api/auth/login', {
    method: 'POST',
    body: credentials,
  });

export const verifyOtp = (payload) =>
  apiRequest('/api/auth/verify-otp', {
    method: 'POST',
    body: payload,
  });

export const resendOtp = (payload) =>
  apiRequest('/api/auth/resend-otp', {
    method: 'POST',
    body: payload,
  });

export const forgotPassword = (payload) =>
  apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: payload,
  });

export const resetPassword = (payload) =>
  apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: payload,
  });

export const startGoogleLogin = (payload) =>
  apiRequest('/api/auth/google/start', {
    method: 'POST',
    body: payload,
  });

export const getGoogleTicket = (ticketId) =>
  apiRequest(`/api/auth/google/ticket/${ticketId}`);
