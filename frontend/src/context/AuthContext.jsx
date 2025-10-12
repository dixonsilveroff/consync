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

  const handleSetToken = (token) => {
    setAccessToken(token || null);
    persistToken(token || null);
  };

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
      setLoading(true);
      try {
        // Set a timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Authentication timeout'));
          }, 5000); // 5 second timeout
        });

        const authProcess = async () => {
          const stored = localStorage.getItem("accessToken");
          if (stored) {
            handleSetToken(stored);
            await fetchProfile();
            return;
          }

          // try refresh (server-side refresh cookie)
          const r = await api.post("/api/auth/refresh");
          const newToken = r.data.accessToken || r.data.token;
          if (newToken) {
            handleSetToken(newToken);
            await fetchProfile();
          } else {
            throw new Error('No token received');
          }
        };

        // Race between timeout and auth process
        await Promise.race([authProcess(), timeoutPromise]);
      } catch (e) {
        // Clear any existing token on error
        handleSetToken(null);
        setUser(null);
        console.error('Auth initialization failed:', e.message);
      } finally {
        if (mounted) {
          setLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    };

    init();
    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchProfile]);

  // login
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      const token = data.accessToken || data.token || data.accessToken;
      if (token) handleSetToken(token);
      if (data.user) setUser(data.user);
      else await fetchProfile();
      return data;
    } catch (err) {
      // bubble up error with some helpful message
      const msg = err.response?.data?.message || err.message || "Login failed";
      throw new Error(msg);
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
    try {
      await api.post("/api/auth/logout");
    } catch (e) {
      // ignore errors on logout
    }
    handleSetToken(null);
    setUser(null);
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
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
