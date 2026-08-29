import { apiRequest } from './http';

export const pingHealth = (options = {}) => apiRequest('/health', options);
