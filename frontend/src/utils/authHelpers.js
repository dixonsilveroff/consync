/**
 * Client-side authentication utilities for token management and validation
 */

export function isTokenExpiringSoon() {
  const lastRefresh = localStorage.getItem('lastTokenRefresh');
  if (!lastRefresh) return true;
  
  // Consider token as expiring if it's older than 14 minutes (tokens usually expire at 15min)
  const REFRESH_THRESHOLD = 14 * 60 * 1000; // 14 minutes in milliseconds
  return Date.now() - parseInt(lastRefresh) > REFRESH_THRESHOLD;
}