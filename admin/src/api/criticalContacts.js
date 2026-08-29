import { apiRequest } from './http';

export const fetchCriticalContacts = (options = {}) =>
  apiRequest('/api/critical-contacts', options);

export const createCriticalContact = (payload, options = {}) =>
  apiRequest('/api/critical-contacts', {
    method: 'POST',
    body: payload,
    ...options,
  });

export const updateCriticalContact = (id, payload, options = {}) =>
  apiRequest(`/api/critical-contacts/${id}`, {
    method: 'PUT',
    body: payload,
    ...options,
  });

export const deleteCriticalContact = (id, options = {}) =>
  apiRequest(`/api/critical-contacts/${id}`, {
    method: 'DELETE',
    ...options,
  });
