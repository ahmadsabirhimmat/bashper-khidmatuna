import { apiRequest } from './http';

export const fetchAboutOverview = (options = {}) =>
  apiRequest('/api/directory/about', options);
