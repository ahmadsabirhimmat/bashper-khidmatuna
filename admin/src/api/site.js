import { apiRequest } from './http';

export const fetchSiteContact = (options = {}) =>
  apiRequest('/api/site/contact', options);

export const updateSiteContact = (payload, options = {}) =>
  apiRequest('/api/site/contact', {
    method: 'PUT',
    body: payload,
    ...options,
  });

export const fetchPolicy = (options = {}) => apiRequest('/api/policy', options);

export const updatePolicy = (payload, options = {}) =>
  apiRequest('/api/policy', {
    method: 'PUT',
    body: payload,
    ...options,
  });
