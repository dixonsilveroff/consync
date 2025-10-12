// Configuration for mock data mode
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Default mock user for development
export const MOCK_USER = {
  id: 'mock-user-1',
  name: 'John Developer',
  email: 'john@consync.dev',
  company: 'ConSync Development',
  role: 'admin',
  avatar: null
};

// API response delay simulation (ms)
export const MOCK_DELAY = 800;

// Simulated API error rate (0-1)
export const MOCK_ERROR_RATE = 0.1;

// Helper function to simulate API delay
export const simulateDelay = async () => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  }
};

// Helper function to simulate random API errors
export const simulateError = () => {
  if (USE_MOCK && Math.random() < MOCK_ERROR_RATE) {
    throw new Error('Simulated API error');
  }
};