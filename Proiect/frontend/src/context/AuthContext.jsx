import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // chiar dacă pică request-ul, golim user-ul local
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthLoading,
      refreshAuth,
      logout,
      isAuthenticated: !!user,
    }),
    [user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth trebuie folosit în interiorul AuthProvider.");
  }
  return ctx;
}