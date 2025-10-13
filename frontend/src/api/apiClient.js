import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true // important: sends refresh cookie to /auth/refresh
});

let accessToken = localStorage.getItem('accessToken');
export function setAccessToken(token) { 
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('lastTokenRefresh', Date.now().toString());
  } else {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('lastTokenRefresh');
  }
}

// Check token freshness
function isTokenExpiringSoon() {
  const lastRefresh = localStorage.getItem('lastTokenRefresh');
  if (!lastRefresh) return true;
  
  // Consider token as expiring if it's older than 14 minutes (tokens usually expire at 15min)
  const REFRESH_THRESHOLD = 14 * 60 * 1000; // 14 minutes in milliseconds
  return Date.now() - parseInt(lastRefresh) > REFRESH_THRESHOLD;
}

let isRefreshing = false;
const refreshSubscribers = [];

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers.length = 0;
};

// Add token to all requests
api.interceptors.request.use(
  async (config) => {
    // Add token to request if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request to:', config.url, 'with token:', token);
    } else {
      console.warn('No token available for request to:', config.url);
    }

    // Skip token refresh checks on auth-related endpoints
    if (config.url?.includes('/login') || config.url?.includes('/register') || config.url?.includes('/refresh')) {
      return config;
    }

    // Check if token needs refresh before making a request
    if (token && isTokenExpiringSoon() && !config.url?.includes('/auth')) {
      try {
        const { data } = await api.post('/api/auth/refresh');
        const newToken = data.accessToken || data.token;
        if (newToken) {
          setAccessToken(newToken);
        }
      } catch (error) {
        console.log('Preemptive token refresh failed:', error);
      }
    }

    if (accessToken && config.url !== '/api/auth/refresh') {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request was already retried, reject
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry refresh token requests and avoid redirect loops on login page
    if (originalRequest.url === '/api/auth/refresh') {
      setAccessToken(null);
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshSubscribers.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await api.post('/api/auth/refresh');
      const newToken = data.accessToken || data.token;
      
      if (!newToken) {
        throw new Error('No token received');
      }

      setAccessToken(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      onTokenRefreshed(newToken);

      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
