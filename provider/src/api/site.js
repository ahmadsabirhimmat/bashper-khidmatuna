import { apiRequest } from './http';

export const fetchSiteContact = (options = {}) =>
  apiRequest('/api/site/contact', options);

export const fetchPolicy = (options = {}) =>
  apiRequest('/api/policy', options);

export const fetchTerms = (options = {}) =>
  apiRequest('/api/policy/terms', options);
