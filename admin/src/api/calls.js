import { apiRequest } from './http';

export const fetchCallEvents = (filters = {}, options = {}) =>
  apiRequest('/api/calls', {
    query: filters,
    ...options,
  });
