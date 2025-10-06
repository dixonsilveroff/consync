import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true, // important: sends refresh cookie to /auth/refresh
});

let accessToken = null;
export function setAccessToken(token) { accessToken = token; }

api.interceptors.request.use(cfg => {
  if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
  return cfg;
});

let isRefreshing = false;
let queue = [];
api.interceptors.response.use(r => r, async err => {
  const original = err.config;
  if (err.response?.status === 401 && !original._retry) {
    if (isRefreshing) {
      return new Promise((res, rej) => queue.push({ res, rej }))
        .then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
    }
    original._retry = true;
    isRefreshing = true;
    try {
      const resp = await api.post("/api/auth/refresh");
      const newToken = resp.data.accessToken;
      setAccessToken(newToken);
      queue.forEach(q => q.res(newToken));
      queue = [];
      return api(original);
    } catch (e) {
      queue.forEach(q => q.rej(e));
      queue = [];
      throw e;
    } finally { isRefreshing = false; }
  }
  throw err;
});

export default api;
