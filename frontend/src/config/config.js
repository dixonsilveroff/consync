// Configuration for development and testing
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';