import { apiRequest } from './http';

export const fetchAppUsers = (filters = {}, options = {}) =>
  apiRequest('/api/users', {
    query: filters,
    ...options,
  });

export const deleteAppUser = (id, options = {}) =>
  apiRequest(`/api/users/${id}`, {
    method: 'DELETE',
    ...options,
  });
