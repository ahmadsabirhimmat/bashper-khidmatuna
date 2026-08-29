import { apiRequest } from './http';

export const fetchProviders = (filters = {}, options = {}) =>
  apiRequest('/api/providers', {
    query: filters,
    ...options,
  });

export const getProviderById = (id, options = {}) => apiRequest(`/api/providers/${id}`, options);

export const createProviderProfile = (payload, options = {}) =>
  apiRequest('/api/providers', {
    method: 'POST',
    body: payload,
    ...options,
  });

export const updateProviderProfile = (id, payload, options = {}) =>
  apiRequest(`/api/providers/${id}`, {
    method: 'PUT',
    body: payload,
    ...options,
  });

export const deleteProviderProfile = (id, options = {}) =>
  apiRequest(`/api/providers/${id}`, {
    method: 'DELETE',
    ...options,
  });

export const reviewProviderStatus = (id, status, options = {}) =>
  apiRequest(`/api/providers/${id}/status`, {
    method: 'PATCH',
    body: { status },
    ...options,
  });
