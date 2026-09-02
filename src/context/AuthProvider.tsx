import { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthContextType } from "./AuthContext";
import type { LoginCredentials } from "../types";
import { mockLogin, mockLogout } from "../api/authAPI";

const initializeAuth = () => {
  const token = localStorage.getItem("auth_token");
  const userStr = localStorage.getItem("auth_user");

  if (!token || !userStr) {
    return { isAuthenticated: false, user: null };
  }

  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.expires < Date.now()) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      return { isAuthenticated: false, user: null };
    }

    return {
      isAuthenticated: true,
      user: JSON.parse(userStr),
    };
  } catch {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    return { isAuthenticated: false, user: null };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState(initializeAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await mockLogin(credentials);

      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("auth_user", JSON.stringify(response.user));

      setAuthState({ isAuthenticated: true, user: response.user });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await mockLogout();

      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      setAuthState({ isAuthenticated: false, user: null });
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
