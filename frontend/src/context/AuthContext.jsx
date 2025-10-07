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
    } catch (e) {
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

    const init = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("accessToken");
        if (stored) {
          handleSetToken(stored);
          await fetchProfile();
          return;
        }

        // try refresh (server-side refresh cookie)
        try {
          const r = await api.post("/api/auth/refresh");
          const newToken = r.data.accessToken || r.data.token;
          if (newToken) {
            handleSetToken(newToken);
            await fetchProfile();
            return;
          }
        } catch (e) {
          // no valid refresh token or other error -> user is not logged in
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => (mounted = false);
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
