import { apiRequest } from './http';

export const fetchSiteContact = (options = {}) =>
  apiRequest('/api/site/contact', options);

export const fetchPolicy = (options = {}) =>
  apiRequest('/api/policy', options);
