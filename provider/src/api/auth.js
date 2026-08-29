import { apiRequest } from './http';

export const registerUser = (payload) =>
  apiRequest('/api/auth/register', {
    method: 'POST',
    body: payload,
  });

export const loginUser = (payload) =>
  apiRequest('/api/auth/login', {
    method: 'POST',
    body: payload,
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

export const fetchCurrentUser = (options = {}) => apiRequest('/api/auth/me', options);

export const deleteAccount = (options = {}) =>
  apiRequest('/api/auth/delete', {
    method: 'DELETE',
    ...options,
  });
