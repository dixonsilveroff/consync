/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setAccessToken } from "../api/apiClient";

const AuthContext = createContext();

// Minimal contract:
// - user: null | { id, name, email, role }
// - login(email,password) -> { user }
// - register(payload) -> { user }
// - logout()
// - updateProfile(data) -> updated user
// - changePassword(currentPassword, newPassword)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // helper to persist accessToken (optional) - we keep it in memory + localStorage for convenience
  const persistToken = (token) => {
    try {
      if (token) localStorage.setItem("accessToken", token);
      else localStorage.removeItem("accessToken");
    } catch (_) {
      // ignore storage errors
    }
  };

  const handleSetToken = useCallback((token) => {
    setAccessToken(token || null);
    persistToken(token || null);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const resp = await api.get("/api/auth/me");
      setUser(resp.data.user);
      return resp.data.user;
    } catch (err) {
      setUser(null);
      throw err;
    }
  }, []);

  // initialize: try local access token first, otherwise try refresh endpoint
  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const init = async () => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        // Always clear the state first to prevent stale data
        handleSetToken(null);
        setUser(null);

        // First try refresh token (server-side cookie)
        try {
          const r = await api.post("/api/auth/refresh");
          const newToken = r.data.accessToken || r.data.token;
          if (newToken) {
            handleSetToken(newToken);
            await fetchProfile();
            return; // Success with refreshed token
          }
        } catch (e) {
          console.log("Refresh token failed, checking localStorage");
        }

        // Then try localStorage (backup)
        const stored = localStorage.getItem("accessToken");
        if (stored) {
          handleSetToken(stored);
          try {
            await fetchProfile();
            return; // Success with stored token
          } catch (e) {
            console.log("Stored token invalid");
            handleSetToken(null); // Clear invalid token
          }
        }

        // If we get here, no valid token found
        setUser(null);
      } catch (e) {
        console.error('Auth initialization failed:', e.message);
        handleSetToken(null);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();
    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchProfile, handleSetToken]);

  // login
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Always start with a clean state
      handleSetToken(null);
      setUser(null);
      localStorage.clear(); // Clear any stored auth data

      // Attempt login
      const { data } = await api.post("/api/auth/login", { 
        email, 
        password,
        // Include client timestamp to help prevent replay attacks
        timestamp: new Date().toISOString() 
      });
      
      // Validate response
      if (!data) throw new Error('Empty response from server');
      
      const token = data.accessToken || data.token;
      if (!token) throw new Error('No token received from login');
      
      // Set token first
      handleSetToken(token);

      // Validate token by fetching profile
      try {
        await fetchProfile();
      } catch (profileErr) {
        handleSetToken(null);
        throw new Error('Failed to validate login session');
      }
      
      return data;
    } catch (err) {
      handleSetToken(null);
      setUser(null);
      localStorage.clear(); // Clean up on error
      const msg = err.response?.data?.message || err.message || "Login failed";
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // register
  const register = async (payload) => {
    try {
      const { data } = await api.post("/api/auth/register", payload);
      const token = data.accessToken || data.token;
      if (token) handleSetToken(token);
      if (data.user) setUser(data.user);
      else await fetchProfile();
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Always try to notify the server
      await api.post("/api/auth/logout");
    } catch (e) {
      console.log('Logout request failed:', e.message);
      // Continue with local cleanup regardless of server response
    } finally {
      // Clean up all auth state
      handleSetToken(null);
      setUser(null);
      localStorage.clear();
      setLoading(false);
      
      // Don't force page reload - let React Router handle navigation
      // Components calling logout should navigate to /login themselves
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put("/api/user/profile", profileData);
      // controller may return updated user
      const updated = data.user || data;
      setUser(updated);
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Update failed";
      throw new Error(msg);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await api.post("/api/user/change-password", { currentPassword, newPassword });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Change password failed";
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register, 
      updateProfile, 
      changePassword,
      fetchProfile  // Add fetchProfile to the context value
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
