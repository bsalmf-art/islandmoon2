import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken } from "../lib/api";

const AuthContext = createContext(null);

const OFFLINE_FLAG = "namu_offline_admin";
const LOCAL_ADMIN_KEY = "namu_local_admin";

// Default offline admin (fallback)
const DEFAULT_OFFLINE_ADMIN = {
  id: "offline-admin",
  name: "إدارة المدونة",
  email: "admin@namu.sa",
  role: "admin",
  avatar_color: "from-pink-400 to-fuchsia-500",
  created_at: new Date().toISOString(),
  is_blocked: false,
  offline: true,
};
const DEFAULT_OFFLINE_PASSWORD = "Admin@2026";

function readLocalAdmin() {
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function offlineAdminProfile() {
  const local = readLocalAdmin();
  if (local) {
    const { password, ...rest } = local;
    return rest;
  }
  return DEFAULT_OFFLINE_ADMIN;
}

function matchOfflineCredentials(email, password) {
  const local = readLocalAdmin();
  if (local && email === local.email && password === local.password) return local;
  if (email === DEFAULT_OFFLINE_ADMIN.email && password === DEFAULT_OFFLINE_PASSWORD) {
    return DEFAULT_OFFLINE_ADMIN;
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    if (localStorage.getItem(OFFLINE_FLAG) === "1") {
      setUser(offlineAdminProfile());
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
      const isNetwork = !err?.response;
      if (isNetwork) {
        const match = matchOfflineCredentials(email, password);
        if (match) {
          localStorage.setItem(OFFLINE_FLAG, "1");
          const { password: _p, ...profile } = match;
          setUser(profile);
          return profile;
        }
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
