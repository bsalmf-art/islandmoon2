import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken } from "../lib/api";

const AuthContext = createContext(null);

// Offline admin profile — shown when backend is unreachable
const OFFLINE_ADMIN = {
  id: "offline-admin",
  name: "بُثينة الفاضل",
  email: "admin@namu.sa",
  role: "admin",
  avatar_color: "from-pink-400 to-fuchsia-500",
  created_at: new Date().toISOString(),
  is_blocked: false,
  offline: true,
};
const OFFLINE_FLAG = "namu_offline_admin";
const OFFLINE_PASSWORD = "Admin@2026";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = guest, object = logged
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    // Offline session takes priority if present
    if (localStorage.getItem(OFFLINE_FLAG) === "1") {
      setUser(OFFLINE_ADMIN);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me", { timeout: 6000 });
      setUser(data);
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const handleAuthResponse = (data) => {
    if (data?.access_token) setAuthToken(data.access_token);
    setUser(data);
    return data;
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password }, { timeout: 8000 });
      return handleAuthResponse(data);
    } catch (err) {
      // Backend offline → allow built-in admin to log in locally
      const isNetwork = !err?.response;
      if (isNetwork && email === OFFLINE_ADMIN.email && password === OFFLINE_PASSWORD) {
        localStorage.setItem(OFFLINE_FLAG, "1");
        setUser(OFFLINE_ADMIN);
        return OFFLINE_ADMIN;
      }
      throw err;
    }
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    return handleAuthResponse(data);
  };

  const logout = async () => {
    localStorage.removeItem(OFFLINE_FLAG);
    try {
      await api.post("/auth/logout", null, { timeout: 4000 });
    } catch {}
    setAuthToken(null);
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
