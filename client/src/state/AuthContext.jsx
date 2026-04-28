import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await http.get("/api/auth/me");
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshMe();
      setBooting(false);
    })();
  }, [refreshMe]);

  const register = useCallback(async ({ name, email, password }) => {
    const { data } = await http.post("/api/auth/register", { name, email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await http.post("/api/auth/login", { email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await http.post("/api/auth/logout");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, booting, register, login, logout, refreshMe, isAuthed: Boolean(user) }),
    [user, booting, register, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

